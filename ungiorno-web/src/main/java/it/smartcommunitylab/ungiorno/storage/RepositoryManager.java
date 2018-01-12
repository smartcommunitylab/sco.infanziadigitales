/**
 * Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package it.smartcommunitylab.ungiorno.storage;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.collections4.CollectionUtils;
import org.bson.types.ObjectId;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.joda.time.LocalTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.TextCriteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.ListMultimap;

import it.smartcommunitylab.ungiorno.beans.GroupDTO;
import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.diary.model.DiaryEntry;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKid;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKid.DiaryKidPerson;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKidProfile;
import it.smartcommunitylab.ungiorno.diary.model.DiaryTeacher;
import it.smartcommunitylab.ungiorno.diary.model.MultimediaEntry;
import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.Author;
import it.smartcommunitylab.ungiorno.model.BusData;
import it.smartcommunitylab.ungiorno.model.ChatMessage;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.KidProfile.DayDefault;
import it.smartcommunitylab.ungiorno.model.KidServices;
import it.smartcommunitylab.ungiorno.model.KidWeeks;
import it.smartcommunitylab.ungiorno.model.LoginData;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile.BusProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile.SectionProfile;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.SectionData.ServiceProfile;
import it.smartcommunitylab.ungiorno.model.SectionDef;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TimeSlotSchoolService;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.usage.UsageEntity;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;
import it.smartcommunitylab.ungiorno.utils.Utils;

@Component
public class RepositoryManager implements RepositoryService {

    private static final Logger logger = LoggerFactory.getLogger(RepositoryManager.class);
    private static final Pattern pattern = Pattern.compile(".*/([^/]*)/image");

    @Autowired
    private AppSetup appSetup;

    @Autowired
    private MongoTemplate template;

    /**
     * @param appId
     */
    @Override
    public void createApp(AppInfo info) {
        App app = getApp(info.getAppId());
        if (app == null) {
            App appDescr = new App();
            appDescr.setAppInfo(info);
            template.save(appDescr);
        }

    }

    @Override
    public App getApp(String appId) {
        Query query = new Query(new Criteria("appInfo.appId").is(appId));
        return template.findOne(query, App.class);
    }

    private Query schoolQuery(String appId, String schoolId) {
        return new Query(new Criteria("appId").is(appId).and("schoolId").is(schoolId));
    }

    private Query appQuery(String appId) {
        return new Query(new Criteria("appId").is(appId));
    }

    private Query kidQuery(String appId, String schoolId, String kidId) {
        return new Query(new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("kidId")
                .is(kidId));
    }

    /**
     * @param profile
     */
    @Override
    public void storeSchoolProfile(SchoolProfile profile) {
        SchoolProfile old = template.findOne(schoolQuery(profile.getAppId(), profile.getSchoolId()),
                SchoolProfile.class);
        if (old != null) {
            profile.set_id(old.get_id());
        } else { // if the a new school profile it must be init
            completeSchoolProfile(profile);
        }
        template.save(profile);
        alignSchoolData(profile);
    }

    /**
     * @param profile
     */
    private void alignSchoolData(SchoolProfile profile) {
        List<KidProfile> profiles =
                getKidProfilesBySchool(profile.getAppId(), profile.getSchoolId());
        if (CollectionUtils.isEmpty(profiles))
            return;

        Set<String> sectionIds = new HashSet<>();
        Set<String> busLines = new HashSet<>();
        Set<String> services = new HashSet<>();
        if (CollectionUtils.isNotEmpty(profile.getSections())) {
            for (SectionProfile s : profile.getSections()) {
                sectionIds.add(s.getSectionId());
            }
        }
        if (CollectionUtils.isNotEmpty(profile.getBuses())) {
            for (BusProfile bus : profile.getBuses()) {
                busLines.add(bus.getBusId());
            }
        }

        if (CollectionUtils.isNotEmpty(profile.getServices())) {
            for (TimeSlotSchoolService s : profile.getServices()) {
                services.add(s.getName());
            }
        }

        for (KidProfile kp : profiles) {
            boolean changed = false;
            // check section exists
            if (kp.getSection() != null && !sectionIds.contains(kp.getSection().getSectionId())) {
                kp.setSection(null);
                changed = true;
            }
            // check groups
            if (kp.getGroups() != null) {
            }
            for (Iterator<SectionDef> iterator = kp.getGroups().iterator(); iterator.hasNext();) {
                SectionDef group = iterator.next();
                if (!sectionIds.contains(group.getSectionId())) {
                    iterator.remove();
                    changed = true;
                }
            }
            // check bus
            if (kp.getServices() != null && kp.getServices().getBus() != null) {
                if (!busLines.contains(kp.getServices().getBus().getBusId())) {
                    kp.getServices().getBus().setBusId(null);
                    changed = true;
                }
            }
            // check time services
            if (kp.getServices() != null && kp.getServices().getTimeSlotServices() != null) {
                for (Iterator<TimeSlotSchoolService> iterator =
                        kp.getServices().getTimeSlotServices().iterator(); iterator.hasNext();) {
                    TimeSlotSchoolService svc = iterator.next();
                    if (!services.contains(svc.getName())) {
                        iterator.remove();
                        changed = true;
                    }

                }
            }
            if (changed) {
                template.save(kp);
            }
        }
        // align teacher sections
        List<Teacher> teachers = getTeachers(profile.getAppId(), profile.getSchoolId());
        if (teachers != null) {
            for (Teacher teacher : teachers) {
                if (teacher.getSectionIds().retainAll(sectionIds)) {
                    template.save(teacher);
                }
            }
        }
    }

    /**
     * The method is null safe
     * 
     * @param {@link SchoolProfile} to complete
     * @return completed {@link SchoolProfile}
     */
    private SchoolProfile completeSchoolProfile(SchoolProfile schoolProfile) {
        if (schoolProfile != null) {
            TimeSlotSchoolService regularService = new TimeSlotSchoolService(
                    TimeSlotSchoolService.DEFAULT_REGULAR_SERVICE_NAME, true);
            // if regular service is already present in the service set, it isn't added
            schoolProfile.getServices().add(regularService);
        }

        return schoolProfile;
    }

    /**
     * @param appId
     * @param schoolId
     * @return SchoolProfile object or null if it doesn't exist
     */
    @Override
    public SchoolProfile getSchoolProfile(String appId, String schoolId) {
        return template.findOne(schoolQuery(appId, schoolId), SchoolProfile.class);
    }

    /**
     * @param appId
     * @param username
     * @return
     */
    @Override
    public SchoolProfile getSchoolProfileForUser(String appId, String username) {
        Query query = Query.query(new Criteria("appId").is(appId).and("accessEmail").is(username));
        return template.findOne(query, SchoolProfile.class);
        // Teacher teacher = template.findOne(query, Teacher.class);
        // if (teacher != null) {
        // return getSchoolProfile(appId, teacher.getSchoolId());
        // }
        // return getSchoolProfile(appId, null);
    }

    /**
     * @param appId
     * @param schoolId
     * @param children
     */
    @Override
    public void updateAuthorizations(String appId, String schoolId, List<KidProfile> children) {
        for (KidProfile kid : children) {
            KidProfile old =
                    template.findOne(kidQuery(appId, schoolId, kid.getKidId()), KidProfile.class);
            if (old != null) {
                Set<String> persons = new HashSet<String>();
                for (Iterator<AuthPerson> iter = old.getPersons().iterator(); iter.hasNext();) {
                    AuthPerson ap = iter.next();
                    if (!ap.isParent())
                        iter.remove();
                    else {
                        persons.add(ap.getPersonId());
                    }
                }
                for (AuthPerson ap : kid.getPersons()) {
                    if (!persons.contains(ap.getPersonId())) {
                        old.getPersons().add(ap);
                    }
                }
                template.save(old);
            } else {
                template.insert(kid);
            }
        }
    }

    /**
     * Updates profiles of kids
     * 
     * @param appId
     * @param schoolId
     * @param children
     */
    @Override
    public void updateChildren(String appId, String schoolId, List<KidProfile> children) {
        for (KidProfile kp : children) {
            for (AuthPerson p : kp.getPersons()) {
                if (StringUtils.isEmpty(p.getPersonId()) && !p.isParent()) {
                    p.setPersonId(ObjectId.get().toString());
                }
            }
        }

        template.remove(schoolQuery(appId, schoolId), KidProfile.class);
        template.insertAll(children);

        for (KidProfile kp : children) {
            Query q = kidQuery(appId, schoolId, kp.getKidId());
            DiaryKid kid = template.findOne(q, DiaryKid.class);
            if (kid != null) {
                Set<String> existing = new HashSet<String>();
                Set<String> existingTeachers = new HashSet<String>();
                for (DiaryKidPerson p : kid.getPersons()) {
                    if (p.isParent())
                        existing.add(p.getPersonId());
                    else
                        existingTeachers.add(p.getPersonId());
                }
                // TODO, currently assume that the kid is not overwritten, add
                // new persons only
                if (kp.getPersons() != null) {
                    for (AuthPerson ap : kp.getPersons()) {
                        if (!existing.contains(ap.getPersonId())) {
                            kid.getPersons().add(ap.toDiaryKidPerson(true));
                        }
                    }
                }
                if (kp.getDiaryTeachers() != null) {
                    for (DiaryTeacher dt : kp.getDiaryTeachers()) {
                        if (!existingTeachers.contains(dt.getTeacherId())) {
                            Teacher teacher = getTeacher(dt.getTeacherId(), appId, schoolId);
                            kid.getPersons().add(teacher.toDiaryKidPerson(true));
                        }
                    }
                }
                template.save(kid);
            } else {
                DiaryKid dk = new DiaryKid();
                dk.setAppId(kp.getAppId());
                dk.setSchoolId(kp.getSchoolId());
                dk.setKidId(kp.getKidId());
                dk.setFirstName(kp.getFirstName());
                dk.setLastName(kp.getLastName());
                dk.setFullName(kp.getFullName());
                dk.setImage(kp.getImage());
                dk.setPersons(new ArrayList<DiaryKid.DiaryKidPerson>());

                if (kp.getPersons() != null) {
                    for (AuthPerson ap : kp.getPersons()) {
                        dk.getPersons().add(ap.toDiaryKidPerson(true));
                    }
                } else {
                    logger.error("No persons for kid " + kp.getKidId());
                }
                if (kp.getDiaryTeachers() != null) {
                    for (DiaryTeacher dt : kp.getDiaryTeachers()) {
                        Teacher teacher = getTeacher(dt.getTeacherId(), appId, schoolId);
                        dk.getPersons().add(teacher.toDiaryKidPerson(true));
                    }
                }
                template.insert(dk);
            }

        }
    }

    /**
     * @param appId
     * @param schoolId
     * @param schoolId
     * @param parents
     */
    @Override
    public void updateParents(String appId, String schoolId, List<Parent> parents) {
        for (Parent parent : parents) {
            Query q = appQuery(appId);
            q.addCriteria(new Criteria("personId").is(parent.getPersonId()));
            // q.addCriteria(new Criteria("username").is(parent.getUsername()).and("personId")
            // .is(parent.getPersonId()).and("firstName").is(parent.getFirstName())
            // .and("lastName").is(parent.getLastName()));
            template.remove(q, Parent.class);
        }
        template.insertAll(parents);
    }

    /**
     * @param appId
     * @param schoolId
     * @param teachers
     */
    @Override
    public void updateTeachers(String appId, String schoolId, List<Teacher> teachers) {
        template.remove(schoolQuery(appId, schoolId), Teacher.class);
        template.insertAll(teachers);
    }

    /**
     * @param appId
     * @param schoolId
     */
    @Override
    public List<DiaryKid> updateDiaryKidPersons(String appId, String schoolId) {
        List<DiaryKid> result = new ArrayList<DiaryKid>();
        List<KidProfile> profiles = template.find(schoolQuery(appId, schoolId), KidProfile.class);
        List<Teacher> teachers = getTeachers(appId, schoolId);
        for (KidProfile kp : profiles) {
            Query q = kidQuery(appId, schoolId, kp.getKidId());
            DiaryKid diaryKid = template.findOne(q, DiaryKid.class);
            if (diaryKid != null) {
                Set<String> existing = new HashSet<String>();
                Set<String> existingTeachers = new HashSet<String>();
                for (DiaryKidPerson p : diaryKid.getPersons()) {
                    if (p.isTeacher()) {
                        existingTeachers.add(p.getPersonId());
                    } else {
                        existing.add(p.getPersonId());
                    } ;
                }
                // TODO, currently assume that the kid is not overwritten, add
                // new persons only
                if (kp.getPersons() != null) {
                    for (AuthPerson ap : kp.getPersons()) {
                        if (!existing.contains(ap.getPersonId())) {
                            diaryKid.getPersons().add(ap.toDiaryKidPerson(true));
                        }
                    }
                }
                for (Teacher teacher : teachers) {
                    if (teacher.getSectionIds().contains(kp.getSection().getSectionId())) {
                        if (!existingTeachers.contains(teacher.getTeacherId())) {
                            diaryKid.getPersons().add(teacher.toDiaryKidPerson(true));
                        }
                    }
                }
                /*
                 * if (kp.getDiaryTeachers() != null) { for (DiaryTeacher dt: kp.getDiaryTeachers())
                 * { if (!existingTeachers.contains(dt.getTeacherId())) { Teacher teacher =
                 * getTeacher(dt.getTeacherId(), appId, schoolId);
                 * diaryKid.getPersons().add(teacher.toDiaryKidPerson(true)); } } }
                 */
                template.save(diaryKid);
                result.add(diaryKid);
            } else {
                DiaryKid dk = new DiaryKid();
                dk.setAppId(kp.getAppId());
                dk.setSchoolId(kp.getSchoolId());
                dk.setKidId(kp.getKidId());
                dk.setFirstName(kp.getFirstName());
                dk.setLastName(kp.getLastName());
                dk.setFullName(kp.getFullName());
                dk.setImage(kp.getImage());
                dk.setPersons(new ArrayList<DiaryKid.DiaryKidPerson>());

                if (kp.getPersons() != null) {
                    for (AuthPerson ap : kp.getPersons()) {
                        if ((ap.getPersonId() == null) || (ap.getPersonId().equals(""))) {
                            continue;
                        }
                        dk.getPersons().add(ap.toDiaryKidPerson(true));
                    }
                } else {
                    logger.error("No persons for kid " + kp.getKidId());
                }
                for (Teacher teacher : teachers) {
                    if (teacher.getSectionIds().contains(kp.getSection().getSectionId())) {
                        dk.getPersons().add(teacher.toDiaryKidPerson(true));
                    }
                }
                /*
                 * if (kp.getDiaryTeachers() != null) { for (DiaryTeacher dt: kp.getDiaryTeachers())
                 * { Teacher teacher = getTeacher(dt.getTeacherId(), appId, schoolId);
                 * dk.getPersons().add(teacher.toDiaryKidPerson(true)); } }
                 */
                template.insert(dk);
                result.add(dk);
            }
        }
        return result;
    }

    /**
     * @param appId
     * @param schoolId
     * @return
     */
    @Override
    public List<Teacher> getTeachers(String appId, String schoolId) {
        return template.find(schoolQuery(appId, schoolId), Teacher.class);
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    @Override
    public KidProfile getKidProfile(String appId, String schoolId, String kidId) {
        return template.findOne(kidQuery(appId, schoolId, kidId), KidProfile.class);
    }

    /**
     * @param appId
     * @param username
     * @return
     */
    @Override
    public List<KidProfile> getKidProfilesByParent(String appId, String username)
            throws ProfileNotFoundException {
        Query q = appQuery(appId);
        if (username == null) {
            throw new ProfileNotFoundException("Profile not found");
        }
        q.addCriteria(new Criteria("username").is(username.toLowerCase()));
        Parent p = template.findOne(q, Parent.class);
        if (p == null) {
            throw new ProfileNotFoundException("Profile not found");
        }

        q = appQuery(appId);
        q.addCriteria(new Criteria("persons")
                .elemMatch(new Criteria("personId").is(p.getPersonId()).and("parent").is(true)));
        return template.find(q, KidProfile.class);
    }

    @Override
    public List<KidProfile> getKidProfilesBySchool(String appId, String schoolId) {
        Query q = appQuery(appId);
        q.addCriteria(new Criteria("schoolId").is(schoolId));
        return template.find(q, KidProfile.class);
    }

    /**
     * @param appId
     * @param username
     * @return
     */
    @Override
    public List<KidProfile> getKidProfilesByTeacher(String appId, String username) {
        Query q = appQuery(appId);
        q.addCriteria(new Criteria("username").is(username));
        Teacher p = template.findOne(q, Teacher.class);

        q = appQuery(appId);
        q.addCriteria(new Criteria("teacherId").is(p.getTeacherId()));
        return template.find(q, KidProfile.class);
    }

    /**
     * @param appId
     * @param schoolId
     * @param sectionId
     * @return
     */
    @Override
    public List<KidProfile> getKidsBySection(String appId, String schoolId, String sectionId) {
        Query q = appQuery(appId);
        q.addCriteria(new Criteria("schoolId").is(schoolId));
        if (sectionId != "all") {
            q.addCriteria(
                    new Criteria().orOperator(Criteria.where("section.sectionId").is(sectionId),
                            Criteria.where("groups.sectionId").is(sectionId)));
        }
        List<KidProfile> p = template.find(q, KidProfile.class);

        return p;
    }

    /**
     * @param appId
     * @param username
     * @return
     */
    @Override
    public List<DiaryKidProfile> getDiaryKidProfilesByAuthId(String appId, String schoolId,
            String authId, boolean isTeacher) {
        Query q = schoolId == null ? appQuery(appId) : schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("persons")
                .elemMatch(new Criteria("personId").is(authId).and("parent").is(!isTeacher)));
        List<DiaryKid> kids = template.find(q, DiaryKid.class);
        List<DiaryKidProfile> profiles = new ArrayList<DiaryKidProfile>();
        for (DiaryKid kid : kids) {
            DiaryKidProfile p = new DiaryKidProfile();
            p.setAppId(kid.getAppId());
            p.setSchoolId(kid.getSchoolId());
            p.setKidId(kid.getKidId());
            p.setAuthorizedPersonsIds(new ArrayList<String>());
            for (DiaryKidPerson ap : kid.getPersons()) {
                if (ap.isAuthorized())
                    p.getAuthorizedPersonsIds().add(ap.getPersonId());
            }
            profiles.add(p);
        }
        return profiles;
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    @Override
    public List<KidProfile.DayDefault> getWeekDefault(String appId, String schoolId, String kidId) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("kidId").is(kidId));
        KidProfile kid = template.findOne(q, KidProfile.class);
        List<KidProfile.DayDefault> weekDefault = kid.getWeekDef();

        SchoolProfile profile = getSchoolProfile(appId, schoolId);
        // school services
        TimeSlotSchoolService regularService = getRegularService(profile);
        if (weekDefault == null) {
            Date today = new Date();
            Calendar cal = Calendar.getInstance();
            cal.setTime(today);
            // 'normal' service

            if (regularService != null) {
                weekDefault = new LinkedList<>();
                for (int i = 0; i < 5; i++) {
                    KidProfile.DayDefault conf = new KidProfile.DayDefault();
                    conf.setEntrata(regularService.getTimeSlots().get(0).getFromTime());
                    conf.setUscita(regularService.getTimeSlots()
                            .get(regularService.getTimeSlots().size() - 1).getToTime());
                    if (kid.getServices() != null && kid.getServices().getBus() != null && kid.getServices().getBus().isEnabled()) {
                        conf.setBus(true);
                        if (kid.getServices().getBus().getStops() != null && kid.getServices().getBus().getStops().size() > 0) {
                        	conf.setFermata(kid.getServices().getBus().getStops().get(0).getStopId());
                        }
                    }
                    weekDefault.add(conf);
                }
                saveWeekDefault(appId, schoolId, kidId, weekDefault);
            }
        } else if (regularService != null) {
        	for (KidProfile.DayDefault day : weekDefault) {
        		if (day.getBus()) {
        			day.setUscita(regularService.getTimeSlots()
                            .get(regularService.getTimeSlots().size() - 1).getToTime());
        		}
        	}
        }

        
        
        return weekDefault;
    }

	private TimeSlotSchoolService getRegularService(SchoolProfile profile) {
		Set<TimeSlotSchoolService> schoolProfileServices = profile.getServices();
        TimeSlotSchoolService regularService = null;
        for (TimeSlotSchoolService ts : schoolProfileServices) {
            if (ts.isRegular()) {
                regularService = ts;
                break;
            }
        }
		return regularService;
	}

    /**
     * @param note
     */
    @Override
    public List<DayDefault> saveWeekDefault(String appId, String schoolId, String kidId,
            List<DayDefault> days) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("kidId").is(kidId));
        KidProfile kid = template.findOne(q, KidProfile.class);
        kid.setWeekDefault(days);
        template.save(kid);
        return days;
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    @Override
    public List<KidProfile.DayDefault> getWeekSpecific(String appId, String schoolId, String kidId,
            int weeknr) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("kidId").is(kidId));
        q.addCriteria(new Criteria("weeknr").is(weeknr));
        KidWeeks week = template.findOne(q, KidWeeks.class);
        if (week != null) {
            SchoolProfile profile = getSchoolProfile(appId, schoolId);
            TimeSlotSchoolService regularService = getRegularService(profile);
            if (regularService != null) {
                for (DayDefault day : week.getDays()) {
                	if (day.getBus()) {
                		day.setUscita(regularService.getTimeSlots()
                                .get(regularService.getTimeSlots().size() - 1).getToTime());
                	}
                }
            }
        	return week.getDays();
        }
        return null;
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param days
     * @return
     */
    @Override
    public List<DayDefault> saveWeekSpecific(String appId, String schoolId, String kidId,
            List<DayDefault> days, int weeknr) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("kidId").is(kidId));
        q.addCriteria(new Criteria("weeknr").is(weeknr));
        template.remove(q, KidWeeks.class);

        KidWeeks week = new KidWeeks();
        week.setAppId(appId);
        week.setSchoolId(schoolId);
        week.setKidId(kidId);
        week.setWeeknr(weeknr);
        week.setDays(days);
        template.save(week);
        return days;
    }

    /**
     * @param appId
     * @param schoolId
     * @return
     */
    @Override
    public List<Communication> getCommunications(String appId, String schoolId) {
        Long today = new Date().getTime();
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria().orOperator(new Criteria("scadenzaDate").gte(today),
                new Criteria("scadenzaDate").is(null)));
        q.with(new Sort(Direction.DESC, "creationDate"));
        return template.find(q, Communication.class);
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    @Override
    public List<Communication> getKidCommunications(String appId, String schoolId, String kidId) {
        Long today = new Date().getTime();

        KidProfile profile = getKidProfile(appId, schoolId, kidId);
        if (profile == null)
            return Collections.emptyList();

        List<String> groups = new LinkedList<>();
        if (profile.getSection() != null)
            groups.add(profile.getSection().getSectionId());
        if (profile.getGroups() != null)
            for (SectionDef s : profile.getGroups())
                groups.add(s.getSectionId());

        Query q = schoolQuery(appId, schoolId);
        // q.addCriteria(new Criteria("children").is(kidId));
        q.addCriteria(new Criteria().orOperator(
                Criteria.where("scadenzaDate").is(null).and("groupId").is(null),
                Criteria.where("scadenzaDate").gte(today).and("groupId").is(null),
                Criteria.where("scadenzaDate").is(null).and("groupId").in(groups),
                Criteria.where("scadenzaDate").gte(today).and("groupId").in(groups)));
        q.with(new Sort(Direction.DESC, "creationDate"));
        return template.find(q, Communication.class);
    }

    /**
     * @param comm
     * @return
     */
    @Override
    public Communication saveCommunication(Communication comm) {
        Query q = schoolQuery(comm.getAppId(), comm.getSchoolId());
        q.addCriteria(new Criteria("communicationId").is(comm.getCommunicationId()));
        Communication old = template.findOne(q, Communication.class);
        if (old != null) {
            comm.set_id(old.get_id());
            comm.setCommunicationId(comm.getCommunicationId());
        } else {
            comm.set_id(ObjectId.get().toString());
            comm.setCommunicationId(comm.get_id());
        }
        if (comm.getAuthor() != null && comm.getAuthor().getId() != null) {
            Teacher teacher = getTeacherByTeacherId(comm.getAuthor().getId(), comm.getAppId(),
                    comm.getSchoolId());
            if (teacher != null) {
                comm.getAuthor().setName(teacher.getTeacherName());
                comm.getAuthor().setSurname(teacher.getTeacherSurname());
                comm.getAuthor().setFullname(teacher.getTeacherFullname());
            }
        }
        comm.setCreationDate(System.currentTimeMillis());
        template.save(comm);
        return comm;
    }

    /**
     * @param comm
     * @return
     */
    @Override
    public Communication getCommunicationById(String appId, String schoolId, String id) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("communicationId").is(id));
        return template.findOne(q, Communication.class);
    }

    /**
     * @param appId
     * @param schoolId
     * @param commId
     */
    @Override
    public void deleteCommunication(String appId, String schoolId, String commId) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("communicationId").is(commId));
        template.remove(q, Communication.class);
    }


    /**
     * @param appId
     * @param schoolId
     * @param date
     * @return
     */
    @Override
    public BusData getBusData(String appId, String schoolId, long date) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("services.bus.enabled").is(true));
        List<KidProfile> kidProfiles = template.find(q, KidProfile.class);
        ListMultimap<String, BusData.KidProfile> mm = ArrayListMultimap.create();

        Calendar cal = Calendar.getInstance();
        cal.setTimeInMillis(date);
        int weeknr = cal.get(Calendar.WEEK_OF_YEAR);
        int daynr = cal.get(Calendar.DAY_OF_WEEK) - 2;
        if (daynr < 0)
            daynr = 6;

        for (KidProfile kp : kidProfiles) {
            BusData.KidProfile busKidProfile = new BusData.KidProfile();

            busKidProfile.setFullName(kp.getFullName());
            busKidProfile.setImage(kp.getImage());
            busKidProfile.setKidId(kp.getKidId());

            List<DayDefault> week = getWeekSpecific(appId, schoolId, kp.getKidId(), weeknr);
            if (week == null || week.isEmpty()) {
                week = getWeekDefault(appId, schoolId, kp.getKidId());
            }
            if (week == null || week.size() <= daynr) {
            	continue;
            }
            DayDefault day = week.get(daynr);

            if (day.getAbsence() || !day.getBus())
                continue;

            busKidProfile.setBusStop(day.getFermata());
            String personId = day.getDelega_name();
            if (personId == null) {
                personId = findDefaultPerson(kp);
            }
            busKidProfile.setPersonWhoWaitId(personId);
            for (AuthPerson ap : kp.getPersons()) {
                if (ap.getPersonId().equals(personId)) {
                	busKidProfile.setPersonWhoWaitName(ap.getFullName());
                	if (ap.isParent()) busKidProfile.setPersonWhoWaitIsParent(true);
                	else busKidProfile.setPersonWhoWaitRelation(ap.getRelation());
                }
            }


            mm.put(kp.getServices().getBus().getBusId(), busKidProfile);
        }
        BusData data = new BusData();
        data.setAppId(appId);
        data.setSchoolId(schoolId);
        data.setDate(timestampToDate(date));
        data.setBuses(new ArrayList<BusData.Bus>());
        SchoolProfile profile = getSchoolProfile(appId, schoolId);

        for (BusProfile p : profile.getBuses()) {
            BusData.Bus b = new BusData.Bus();
            b.setBusId(p.getBusId());
            b.setBusName(p.getName());
            b.setChildren(mm.get(b.getBusId()));
            data.getBuses().add(b);
        }
        return data;
    }

    /**
     * @param appId
     * @param schoolId
     * @param sections
     * @param date
     * @return
     */
    @Override
    public List<SectionData> getSections(String appId, String schoolId, Collection<String> sections, long date) {
        SchoolProfile profile = getSchoolProfile(appId, schoolId);
        Calendar cal = Calendar.getInstance();
        int weeknr = cal.get(Calendar.WEEK_OF_YEAR);
        int daynr = cal.get(Calendar.DAY_OF_WEEK) - 2;
        if (daynr < 0)
            daynr = 6;
        // all school secton data
        Map<String, SectionData> map = new HashMap<String, SectionData>();
        for (SectionProfile p : profile.getSections()) {
            if (sections != null && !sections.isEmpty() && !sections.contains(p.getSectionId()))
                continue;

            SectionData sd = new SectionData();
            sd.setSectionId(p.getSectionId());
            sd.setSectionName(p.getName());
            sd.setAppId(appId);
            sd.setSchoolId(schoolId);
            sd.setChildren(new ArrayList<SectionData.KidProfile>());
            map.put(p.getSectionId(), sd);
        }
        // kid profiles
        List<KidProfile> kids = readKidsForSections(appId, schoolId, sections);
        // school services
        Set<TimeSlotSchoolService> schoolProfileServices = profile.getServices();
        Map<String, TimeSlotSchoolService> serviceMap = new HashMap<>();
        
        // 'normal' service
        TimeSlotSchoolService regularService = new TimeSlotSchoolService("test", true);
        for (TimeSlotSchoolService ts : schoolProfileServices) {
            if (ts.isRegular()) {
                regularService = ts;
            }
            serviceMap.put(ts.getName(), ts);
        }

        // extract kid service mappings
        for (KidProfile kp : kids) {

            KidServices kidServices = kp.getServices();
            List<String> allKidFascie = new ArrayList<String>();
            List<TimeSlotSchoolService.ServiceTimeSlot> allFascie =
                    new ArrayList<TimeSlotSchoolService.ServiceTimeSlot>();
            // add regular slots by default
            for (TimeSlotSchoolService.ServiceTimeSlot fasc : regularService.getTimeSlots()) {
                allKidFascie.add(fasc.getName());
                allFascie.add(fasc);
            }

            // read other services. Ignore for non-participating kids
            if (kp.isPartecipateToSperimentation() && kidServices != null
                    && kidServices.getTimeSlotServices() != null) {
                for (TimeSlotSchoolService kts : kidServices.getTimeSlotServices()) {
                	TimeSlotSchoolService ts = serviceMap.get(kts.getName());
                    // handle ignore disabled and regular slots
                    if (kts.isEnabled() && !ts.isRegular()) {
                        for (TimeSlotSchoolService.ServiceTimeSlot fasc : ts.getTimeSlots()) {
                            allKidFascie.add(fasc.getName());
                            allFascie.add(fasc);
                        }
                    }
                }
            }
            // default week
            List<DayDefault> defaultWeek = kp.getWeekDef();
            // current week
            KidWeeks kidWeekConfig = readKidWeeks(appId, schoolId, kp.getKidId(), weeknr);
            DayDefault todayConfig = null;

            // get Day info from KidWeeks if there is a configuration for this week
            if (kp.isPartecipateToSperimentation() && kidWeekConfig != null && daynr < 5) {
                List<DayDefault> days = kidWeekConfig.getDays();
                todayConfig = (days != null && days.size() > daynr && days.get(daynr) != null ? days.get(daynr) : todayConfig);
                // get DayInfo from WeekDefault if defined
            } else if (kp.isPartecipateToSperimentation() && defaultWeek != null && daynr < 5) {
                todayConfig =
                        (defaultWeek.get(daynr) != null ? defaultWeek.get(daynr) : todayConfig);
                // construct data from kid profile
            } else {
                // get the configuration from the regular school service
                todayConfig = new DayDefault();
                todayConfig.setAbsence(false);
                // baseline for entrance: regular service time start
                todayConfig.setEntrata(regularService.getTimeSlots().get(0).getFromTime());
                // baseline for exit: regular service time end
                todayConfig.setUscita(regularService.getTimeSlots()
                        .get(regularService.getTimeSlots().size() - 1).getToTime());
                // baseline for bus: service is enabled
                if (kidServices != null && kidServices.getBus() != null) {
                    todayConfig.setBus(kidServices.getBus().isEnabled());
                }
                if (kidServices != null && kidServices.getTimeSlotServices() != null
                        && allFascie.size() > 0) {
                    // get the configuration from the services of kid
                    sortFascie(allFascie);
                    DateTime minSlotDate = allFascie.get(0).getFromTime();
                    LocalTime minhour = minSlotDate.toLocalTime();
                    if (minhour.isBefore(todayConfig.getEntrata().toLocalTime())) {
                        todayConfig.setEntrata(minSlotDate);
                    }
                    DateTime maxSlotDate = allFascie.get(allFascie.size() - 1).getToTime();
                    LocalTime maxhour = maxSlotDate.toLocalTime();
                    if (maxhour.isAfter(todayConfig.getUscita().toLocalTime())) {
                        todayConfig.setUscita(maxSlotDate);
                    }
                }
            }

            //if bus is set, the exit time is the end of the regular timing
            if (todayConfig.getBus()) {
                todayConfig.setUscita(regularService.getTimeSlots()
                        .get(regularService.getTimeSlots().size() - 1).getToTime());

            }	
            
            SectionData.KidProfile skp = new SectionData.KidProfile();
            skp.setKidId(kp.getKidId());
            skp.setChildrenName(kp.getFirstName() + " " + kp.getLastName());
            skp.setImage(kp.getImage());
            skp.setActive(kp.isActive());
            skp.setBus(new ServiceProfile(todayConfig.getBus(), todayConfig.getBus()));
            skp.setfascieNames(allKidFascie);
            skp.setfascieList(allFascie);
            skp.setPartecipateToSperimentation(kp.isPartecipateToSperimentation());

            // merge service state from kidProfile Serivces or from schoolProfile
            skp.setServices(kp.getServices());

            // if absent, set exit time to null
            if (todayConfig.getAbsence()) {
                skp.setExitTime(null);
                skp.setEntryTime(null);
                if (todayConfig.getMotivazione() != null) {
                    skp.setAbsenceType(todayConfig.getMotivazione().getType());
                    skp.setAbsenceSubtype(todayConfig.getMotivazione().getSubtype());
                }
            } else {
                skp.setExitTime(todayConfig.getUscita());
                skp.setEntryTime(todayConfig.getEntrata());
            }
            if (todayConfig.getFermata() != null) {
                skp.setStopId(todayConfig.getFermata());
            }

            // read from ritiro object
            String personId = todayConfig.getDelega_name();

            if (personId == null) {
                personId = findDefaultPerson(kp);
            }

            skp.setPersonId(personId);
            for (AuthPerson ap : kp.getPersons()) {
                if (ap.getPersonId().equals(personId))
                    skp.setPersonName(ap.getFullName());
            }

            // normalize times:
            if (skp.getEntryTime() != null)
                skp.setEntryTime(skp.getEntryTime().withDate(LocalDate.now()));
            if (skp.getExitTime() != null)
                skp.setExitTime(skp.getExitTime().withDate(LocalDate.now()));

            if (kp.getSection() != null && kp.getSection().getSectionId() != null
                    && map.containsKey(kp.getSection().getSectionId())
                    && map.get(kp.getSection().getSectionId()).getChildren() != null) {
                map.get(kp.getSection().getSectionId()).getChildren().add(skp);
            }
        }

        return new ArrayList<SectionData>(map.values());
    }

    private KidWeeks readKidWeeks(String appId, String schoolId, String kidId, int weeknr) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("kidId").is(kidId).and("weeknr").is(weeknr));
        KidWeeks kidWeek = template.findOne(q, KidWeeks.class);

        return kidWeek;
    }

    /**
     * Sort time slots. Assume no overlapping possible so the order is a total order both for
     * entrance time and exist time
     * 
     * @param allFascie
     */
    public void sortFascie(List<TimeSlotSchoolService.ServiceTimeSlot> allFascie) {
        if ((allFascie != null) && (allFascie.size() > 0)) {
            Comparator<TimeSlotSchoolService.ServiceTimeSlot> comparator =
                    new Comparator<TimeSlotSchoolService.ServiceTimeSlot>() {
                        @Override
                        public int compare(TimeSlotSchoolService.ServiceTimeSlot o1,
                                TimeSlotSchoolService.ServiceTimeSlot o2) {
                            LocalTime date1 = o1.getFromTime().toLocalTime();
                            LocalTime date2 = o2.getFromTime().toLocalTime();
                            return date1.compareTo(date2);
                        }
                    };
            Collections.sort(allFascie, comparator);
        }
    }

    private List<KidProfile> readKidsForSections(String appId, String schoolId,
            Collection<String> sections) {
        Query q = schoolQuery(appId, schoolId);
        if (sections != null) {
            q.addCriteria(new Criteria("section.sectionId").in(sections));
        }
        List<KidProfile> kids = template.find(q, KidProfile.class);
        return kids;
    }

    private List<KidProfile> readKidsForSectionsOrGroups(String appId, String schoolId,
            Collection<String> sections) {
        Query q = schoolQuery(appId, schoolId);
        if (sections != null) {
            q.addCriteria(
                    new Criteria().orOperator(Criteria.where("section.sectionId").in(sections),
                            Criteria.where("groups.sectionId").in(sections)));
        }
        List<KidProfile> kids = template.find(q, KidProfile.class);
        return kids;
    }


    /**
     * @param kp
     * @return
     */
    private String findDefaultPerson(KidProfile kp) {
        if (kp == null || kp.getPersons() == null || kp.getPersons().isEmpty())
            return null;
        return kp.getPersons().get(0).getPersonId();
    }


    private long timestampToDate(long timestamp) {
        timestamp = timestamp == 0 ? System.currentTimeMillis() : timestamp;
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(timestamp);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis();
    }

    /**
     * @return
     */
    @Override
    public Teacher getTeacher(String username, String appId, String schoolId) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("username").is(username));
        return template.findOne(q, Teacher.class);
    }

    @Override
    public Teacher getTeacherByTeacherId(String teacherId, String appId, String schoolId) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("teacherId").is(teacherId));
        return template.findOne(q, Teacher.class);
    }

    @Override
    public Teacher deleteTeacherByTeacherId(String teacherId, String appId, String schoolId) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("teacherId").is(teacherId));
        Teacher toRemove = getTeacherByTeacherId(teacherId, appId, schoolId);
        if (toRemove != null) {
            template.remove(q, Teacher.class);
        }
        return toRemove;
    }

    // public Teacher saveOrUpdateTeacher(String appId,String schoolId, Teacher
    // teacher) {
    // Query q = schoolQuery(appId, schoolId);
    // q.addCriteria(new Criteria("teacherId").is(teacher.getTeacherId()));
    // Teacher actualTeacherProfile = template.findOne(q, Teacher.class);
    // if(actualTeacherProfile != null) {
    // teacher.set
    // }
    // }

    @Override
    public Teacher getTeacherByPin(String pin, String appId, String schoolId) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("pin").is(pin));
        return template.findOne(q, Teacher.class);
    }

    /**
     * @return
     */
    @Override
    public Parent getParent(String username, String appId, String schoolId) {
        Query q = appQuery(appId);
        q.addCriteria(new Criteria("username").is(username.toLowerCase()));
        Parent p = template.findOne(q, Parent.class);
        return p;
    }

    @Override
    public List<DiaryEntry> getDiary(String appId, String schoolId, String kidId, String search,
            Integer skip, Integer pageSize, Long from, Long to, String tag) {
        Query q = kidQuery(appId, schoolId, kidId);

        if (search != null) {
            TextCriteria tc = TextCriteria.forDefaultLanguage().matchingAny(search);
            q.addCriteria(tc);
        }

        if (from != null || to != null) {
            Criteria dateCriteria = new Criteria("date");
            if (from != null) {
                dateCriteria = dateCriteria.gte(from);
            }
            if (to != null) {
                dateCriteria = dateCriteria.lte(to);
            }
            q.addCriteria(dateCriteria);
        }

        if (tag != null) {
            q.addCriteria(new Criteria("tags").is(tag));
        }
        if (skip != null) {
            q = q.skip(skip);
        }
        if (pageSize != null) {
            q = q.limit(pageSize);
        }
        q.with(new Sort(Direction.DESC, "date"));

        return template.find(q, DiaryEntry.class);
    }

    @Override
    public DiaryEntry getDiaryEntry(String appId, String schoolId, String kidId, String entryId) {
        Query q = kidQuery(appId, schoolId, kidId);
        q.addCriteria(new Criteria("entryId").is(entryId));
        return template.findOne(q, DiaryEntry.class);
    }

    @Override
    public void deleteDiaryEntry(String appId, String schoolId, String kidId, String entryId) {
        // TODO cleanup multimedia
        Query q = kidQuery(appId, schoolId, kidId);
        q.addCriteria(new Criteria("entryId").is(entryId));
        template.remove(q, DiaryEntry.class);
    }

    @Override
    public void saveDiaryEntry(DiaryEntry diary) {
        Query q = kidQuery(diary.getAppId(), diary.getSchoolId(), diary.getKidId());
        q.addCriteria(new Criteria("entryId").is(diary.getEntryId()));
        template.remove(q, DiaryEntry.class);
        template.save(diary);
    }

    @Override
    public MultimediaEntry getMultimediaEntry(String appId, String schoolId, String kidId,
            String multimediaId) {
        Query q = kidQuery(appId, schoolId, kidId);
        q.addCriteria(new Criteria("multimediaId").is(multimediaId));
        return template.findOne(q, MultimediaEntry.class);
    }

    @Override
    public void saveMultimediaEntry(MultimediaEntry multimediaEntry) {
        Query q = kidQuery(multimediaEntry.getAppId(), multimediaEntry.getSchoolId(),
                multimediaEntry.getKidId());
        q.addCriteria(new Criteria("multimediaId").is(multimediaEntry.getMultimediaId()));
        template.remove(q, MultimediaEntry.class);
        template.save(multimediaEntry);
    }


    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    @Override
    public DiaryKid getDiaryKid(String appId, String schoolId, String kidId) {
        DiaryKid kid = template.findOne(kidQuery(appId, schoolId, kidId), DiaryKid.class);
        return kid;
    }

    /**
     * @param kid
     * @param isTeacher
     * @return
     */
    @Override
    public DiaryKid updateDiaryKid(DiaryKid kid, boolean isTeacher) {
        DiaryKid old = template.findOne(kidQuery(kid.getAppId(), kid.getSchoolId(), kid.getKidId()),
                DiaryKid.class);
        if (old != null) {
            kid.set_id(old.get_id());
        }
        template.save(kid);
        return kid;
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param skip
     * @param pageSize
     * @param from
     * @param to
     * @return
     */
    @Override
    public List<MultimediaEntry> getMultimediaEntries(String appId, String schoolId, String kidId,
            Integer skip, Integer pageSize, Long from, Long to) {

        Query q = kidQuery(appId, schoolId, kidId);

        if (from != null || to != null) {
            Criteria dateCriteria = new Criteria("timestamp");
            if (from != null) {
                dateCriteria = dateCriteria.gte(from);
            }
            if (to != null) {
                dateCriteria = dateCriteria.lte(to);
            }
            q.addCriteria(dateCriteria);
        }

        if (skip != null) {
            q = q.skip(skip);
        }
        if (pageSize != null) {
            q = q.limit(pageSize);
        }
        q.with(new Sort(Direction.DESC, "timestamp"));
        return template.find(q, MultimediaEntry.class);
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param entryId
     */
    @Override
    public void cleanImages(String appId, String schoolId, String kidId, String entryId) {
        DiaryEntry de = getDiaryEntry(appId, schoolId, kidId, entryId);
        if (de != null && de.getPictures() != null) {
            cleanImages(appId, schoolId, kidId, entryId, new HashSet<String>(de.getPictures()));
        }
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param entryId
     * @param oldPics
     */
    @Override
    public void cleanImages(String appId, String schoolId, String kidId, String entryId,
            Set<String> oldPics) {
        if (oldPics == null || oldPics.isEmpty())
            return;

        Query q = kidQuery(appId, schoolId, kidId);
        Set<String> ids = new HashSet<String>();
        for (String p : oldPics) {
            String id = getImageId(p);
            if (id != null) {
                ids.add(id);
            }
        }

        q.addCriteria(Criteria.where("multimediaId").in(ids));
        template.remove(q, MultimediaEntry.class);

        for (String id : ids) {
            File f = new File(appSetup.getUploadDirectory() + "/" + id);
            if (f.exists()) {
                f.delete();
            }

        }
    }

    /**
     * @param p
     * @return
     */
    private static String getImageId(String p) {
        Matcher m = pattern.matcher(p);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }

    @Override
    public List<ChatMessage> getChatMessages(String appId, String schoolId, String kidId,
            long timestamp, int limit) {
        List<ChatMessage> result = null;
        Criteria criteria =
                new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("kidId").is(kidId);
        if (timestamp > 0) {
            criteria = criteria.and("creationDate").lte(timestamp);
        }
        Query query = new Query(criteria);
        query.with(new Sort(Sort.Direction.DESC, "creationDate"));
        if (limit > 0) {
            query.limit(limit);
        }
        result = template.find(query, ChatMessage.class);
        return result;
    }

    @Override
    public ChatMessage saveChatMessage(ChatMessage message) {
        message.setMessageId(Utils.getUUID());
        template.save(message);
        return message;
    }

    @Override
    public ChatMessage removeChatMessage(String appId, String schoolId, String messageId) {
        Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId)
                .and("messageId").is(messageId);
        Query query = new Query(criteria);
        ChatMessage dbMessage = template.findOne(query, ChatMessage.class);
        if (dbMessage != null) {
            template.remove(query, ChatMessage.class);
        }
        return dbMessage;
    }

    @Override
    public ChatMessage updateChatMessage(ChatMessage message) {
        Criteria criteria = new Criteria("appId").is(message.getAppId()).and("schoolId")
                .is(message.getSchoolId()).and("messageId").is(message.getMessageId());
        Query query = new Query(criteria);
        ChatMessage dbMessage = template.findOne(query, ChatMessage.class);
        if (dbMessage != null) {
            Update update = new Update();
            update.set("text", message.getText());
            update.set("received", message.isReceived());
            update.set("seen", message.isSeen());
            template.updateFirst(query, update, ChatMessage.class);
            dbMessage.setText(message.getText());
            dbMessage.setReceived(message.isReceived());
            dbMessage.setSeen(message.isSeen());
        }
        return dbMessage;
    }

    @Override
    public ChatMessage chatMessageReceived(String appId, String schoolId, String messageId) {
        Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId)
                .and("messageId").is(messageId);
        Query query = new Query(criteria);
        ChatMessage dbMessage = template.findOne(query, ChatMessage.class);
        if (dbMessage != null) {
            Update update = new Update();
            update.set("received", Boolean.TRUE);
            template.updateFirst(query, update, ChatMessage.class);
            dbMessage.setReceived(Boolean.TRUE);
        }
        return dbMessage;
    }

    @Override
    public ChatMessage chatMessageSeen(String appId, String schoolId, String messageId) {
        Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId)
                .and("messageId").is(messageId);
        Query query = new Query(criteria);
        ChatMessage dbMessage = template.findOne(query, ChatMessage.class);
        if (dbMessage != null) {
            Update update = new Update();
            update.set("seen", Boolean.TRUE);
            template.updateFirst(query, update, ChatMessage.class);
            dbMessage.setSeen(Boolean.TRUE);
        }
        return dbMessage;
    }

    @Override
    public LoginData getTokenData(String username) {
        return template.findOne(new Query(new Criteria("username").is(username)), LoginData.class);
    }

    @Override
    public LoginData getTokenDataByPersonId(String personId, String appId) {
        Query q = appQuery(appId);
        q.addCriteria(new Criteria("personId").is(personId).and("username").ne(null));
        Parent p = template.findOne(q, Parent.class);
        if (p == null)
            return null;
        return template.findOne(new Query(new Criteria("username").is(p.getUsername())),
                LoginData.class);
    }

    @Override
    public void saveTokenData(LoginData loginData) {
        template.save(loginData);
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    @Override
    public Long getUnreadChatMessageCount(String appId, String schoolId, String kidId,
            String sender) {
        Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId)
                .and("kidId").is(kidId).and("sender").is(sender).and("seen").is(false);
        Query query = new Query(criteria);
        query.with(new Sort(Sort.Direction.DESC, "creationDate"));
        return template.count(query, ChatMessage.class);
    }

    /**
     * @param appId
     * @param schoolId
     * @param sentByParent
     * @return
     */
    @Override
    public Map<String, Map<String, Integer>> getAllUnreadChatMessageCount(String appId,
            String schoolId, String sender) {
        Map<String, Map<String, Integer>> result = new HashMap<String, Map<String, Integer>>();
        Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId)
                .and("sender").is(sender).and("seen").is(false);
        Query query = new Query(criteria);
        query.fields().include("kidId");
        List<ChatMessage> found = template.find(query, ChatMessage.class);
        Map<String, String> sections = new HashMap<String, String>();
        for (ChatMessage msg : found) {
            String section = sections.get(msg.getKidId());
            if (section == null) {
                KidProfile profile = getKidProfile(appId, schoolId, msg.getKidId());
                if (profile == null || profile.getSection() == null)
                    continue;
                section = profile.getSection().getSectionId();
                sections.put(msg.getKidId(), section);
            }
            Map<String, Integer> sectionCounts = result.get(section);
            if (sectionCounts == null) {
                sectionCounts = new HashMap<String, Integer>();
                result.put(section, sectionCounts);
            }
            Integer count = sectionCounts.get(msg.getKidId());
            if (count == null) {
                sectionCounts.put(msg.getKidId(), 1);
            } else {
                sectionCounts.put(msg.getKidId(), count + 1);
            }
        }

        return result;
    }

    /**
     * @param appId
     * @param schoolId
     * @param teacherId
     * @return
     */
    @Override
    public Author getTeacherAsAuthor(String appId, String schoolId, String teacherId) {
        Teacher teacher = getTeacherByTeacherId(teacherId, appId, schoolId);
        Author a = null;
        if (teacher != null) {
            a = new Author();
            a.setName(teacher.getTeacherName());
            a.setSurname(teacher.getTeacherSurname());
            a.setFullname(teacher.getTeacherFullname());
        }
        return a;
    }

    /**
     * @param appId
     * @param schoolId
     * @param userId
     * @return
     */
    @Override
    public Author getTeacherAsParent(String appId, String schoolId, String userId) {
        Parent p = getParent(userId, appId, schoolId);
        Author a = null;
        if (p != null) {
            a = new Author();
            a.setName(p.getFirstName());
            a.setSurname(p.getLastName());
            a.setFullname(p.getFullName());
        }
        return a;
    }

    @Override
    public void saveUsageEntity(UsageEntity entity) {
        template.save(entity);
    }

    @Override
    public List<UsageEntity> findUsageEntities(String appId, String schoolId, UsageAction action) {
        Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId);
        if (action != null) {
            criteria = criteria.and("action").is(action.toString());
        }

        Query query = new Query(criteria).with(new Sort(Sort.Direction.ASC, "timestamp"));

        List<UsageEntity> results = template.find(query, UsageEntity.class);

        return results;
    }

    @Override
    public KidProfile updateKid(KidProfile kid) {
        if (kid.getPersons() != null) {
            for (AuthPerson p : kid.getPersons()) {
                if (StringUtils.isEmpty(p.getPersonId()) && !p.isParent()) {
                    p.setPersonId(ObjectId.get().toString());
                }
            }
        }
        // Criteria criteria =
        // new Criteria("appId").is(kid.getAppId()).and("schoolId").is(kid.getSchoolId());
        // criteria.and("kidId").is(kid.getKidId());
        // Query q = new Query(criteria);
        // DBObject dbObject = new BasicDBObject();
        // template.getConverter().write(kid, dbObject);
        // Update updateDoc = Update.fromDBObject(dbObject);
        // return template.findAndModify(q, updateDoc, KidProfile.class);
        Query q = kidQuery(kid.getAppId(), kid.getSchoolId(), kid.getKidId());
        template.remove(q, KidProfile.class);

        template.save(kid);
        return kid;
    }

    @Override
    public GroupDTO getGroupData(String appId, String schoolId, String groupId) {
        SchoolProfile profile = getSchoolProfile(appId, schoolId);
        List<SectionProfile> sections = profile.getSections();
        GroupDTO group = null;
        if (sections != null) {
            for (SectionProfile section : sections) {
                if (section.getSectionId().equalsIgnoreCase(groupId)) {
                    group = new GroupDTO();
                    group.setId(groupId);
                    group.setName(section.getName());
                    group.setSection(!section.isGroup());
                    List<KidProfile> kidsInGroup =
                            readKidsForSectionsOrGroups(appId, schoolId, Arrays.asList(groupId));
                    List<String> kidIdsInGroup = new ArrayList<>();
                    for (KidProfile kid : kidsInGroup) {
                        kidIdsInGroup.add(kid.getKidId());
                    }
                    group.setKidIds(kidIdsInGroup);
                    List<Teacher> teachers = getTeachers(appId, schoolId);
                    List<String> teacherIdsInGroup = new ArrayList<>();
                    for (Teacher teacher : teachers) {
                        if (teacher.getSectionIds().contains(groupId)) {
                            teacherIdsInGroup.add(teacher.getTeacherId());
                        }
                    }

                    group.setTeacherIds(teacherIdsInGroup);
                }
            }
        }

        return group;
    }

    @Override
    public List<GroupDTO> getGroupsDataBySchool(String appId, String schoolId) {
        SchoolProfile school = getSchoolProfile(appId, schoolId);
        List<GroupDTO> groups = new ArrayList<>();
        if (school.getSections() != null) {
            for (SectionProfile section : school.getSections()) {
                groups.add(getGroupData(appId, schoolId, section.getSectionId()));
            }
        }
        return groups;
    }

    @Override
    public Teacher saveOrUpdateTeacher(String appId, String schoolId, Teacher teacher) {
        teacher.setAppId(appId);
        teacher.setSchoolId(schoolId);
        template.save(teacher);
        return teacher;

    }

    @Override
    public SchoolProfile getSchoolProfileByName(String appId, String name) {
        Query query = new Query(new Criteria("appId").is(appId).and("name").is(name));
        return template.findOne(query, SchoolProfile.class);
    }

    @Override
    public KidProfile saveKidProfile(KidProfile kidProfile) {
        Query query = new Query(new Criteria("appId").is(kidProfile.getAppId()).and("kidId")
                .is(kidProfile.getKidId()));
        KidProfile kidDb = template.findOne(query, KidProfile.class);
        if (kidDb == null) {
            template.save(kidProfile);
        }
        return kidProfile;
    }


}
