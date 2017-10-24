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
import java.text.ParseException;
import java.text.SimpleDateFormat;
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
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.bson.types.ObjectId;
import org.joda.time.DateTime;
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

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.ListMultimap;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;

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
import it.smartcommunitylab.ungiorno.model.CalendarItem;
import it.smartcommunitylab.ungiorno.model.ChatMessage;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.InternalNote;
import it.smartcommunitylab.ungiorno.model.KidBusData;
import it.smartcommunitylab.ungiorno.model.KidCalAssenza;
import it.smartcommunitylab.ungiorno.model.KidCalFermata;
import it.smartcommunitylab.ungiorno.model.KidCalNote;
import it.smartcommunitylab.ungiorno.model.KidCalNote.Note;
import it.smartcommunitylab.ungiorno.model.KidCalRitiro;
import it.smartcommunitylab.ungiorno.model.KidConfig;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.KidProfile.DayDefault;
import it.smartcommunitylab.ungiorno.model.KidServices;
import it.smartcommunitylab.ungiorno.model.KidWeeks;
import it.smartcommunitylab.ungiorno.model.LoginData;
import it.smartcommunitylab.ungiorno.model.Menu;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile.BusProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile.SectionProfile;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.SectionData.ServiceProfile;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TeacherCalendar;
import it.smartcommunitylab.ungiorno.model.TimeSlotSchoolService;
import it.smartcommunitylab.ungiorno.model.TimeSlotSchoolService.ServiceTimeSlot;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.usage.UsageEntity;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageActor;
import it.smartcommunitylab.ungiorno.utils.Utils;

@Component
public class RepositoryManager implements RepositoryService {

    private static final Logger logger = LoggerFactory.getLogger(RepositoryManager.class);
    private static final Pattern pattern = Pattern.compile(".*/([^/]*)/image");

    @Autowired
    private AppSetup appSetup;

    @Autowired
    private MongoTemplate template;

    private static final SimpleDateFormat TIME_FORMAT = new SimpleDateFormat("hh:mm");

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
            q.addCriteria(new Criteria("username").is(parent.getUsername()).and("personId")
                    .is(parent.getPersonId()).and("firstName").is(parent.getFirstName())
                    .and("lastName").is(parent.getLastName()));
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
     * @param studentId
     * @param from
     * @param to
     * @return
     */
    @Override
    public List<CalendarItem> getCalendar(String appId, String schoolId, String kidId, long from,
            long to) {
        // TODO
        // read school calendar
        // merge assenze
        return DumpDataHelper.dummyCalendar(appId, schoolId, kidId, from, to);
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
     * @param schoolId
     * @param kidId
     * @return
     */
    @Override
    public KidConfig getKidConfig(String appId, String schoolId, String kidId) {
        return template.findOne(kidQuery(appId, schoolId, kidId), KidConfig.class);
    }

    /**
     * @param config
     * @return
     */
    @Override
    public KidConfig saveConfig(KidConfig config) {
        // TODO: MERGE of data?
        KidConfig old = getKidConfig(config.getAppId(), config.getSchoolId(), config.getKidId());
        if (old != null) {
            config.set_id(old.get_id());
        }
        template.save(config);
        return config;
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
        q.addCriteria(new Criteria("username").is(username));
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
     * @param stop
     * @return
     */
    @Override
    public KidConfig saveStop(KidCalFermata stop) {
        stop.setDate(timestampToDate(stop.getDate()));
        Query q = kidQuery(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
        q.addCriteria(new Criteria("date").is(stop.getDate()));
        template.remove(q, KidCalFermata.class);

        // delete direct ritiro
        q = kidQuery(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
        addDayCriteria(stop.getDate(), q);
        template.remove(q, KidCalRitiro.class);
        // delete absence for that date
        q = kidQuery(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
        q.addCriteria(new Criteria("dateFrom").is(stop.getDate()));
        template.remove(q, KidCalAssenza.class);

        template.save(stop);
        return getKidConfig(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param date
     * @return
     */
    @Override
    public KidCalFermata getStop(String appId, String schoolId, String kidId, long date) {
        Query q = kidQuery(appId, schoolId, kidId);
        q.addCriteria(new Criteria("date").is(timestampToDate(date)));
        return template.findOne(q, KidCalFermata.class);
    }

    @Override
    public List<KidCalFermata> getStop(String appId, String schoolId, String kidId, long dateFrom,
            long dateTo) {
        Query q = kidQuery(appId, schoolId, kidId);
        long dateTimestampFrom = timestampToDate(dateFrom);
        long dateTimestampTo = timestampToDate(dateTo);
        q.addCriteria(new Criteria().andOperator(new Criteria("date").gte(dateTimestampFrom),
                new Criteria("date").lte(dateTimestampTo)));
        return template.find(q, KidCalFermata.class);
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param date
     * @return
     */
    @Override
    public KidCalAssenza getAbsence(String appId, String schoolId, String kidId, long date) {
        Query q = kidQuery(appId, schoolId, kidId);
        q.addCriteria(new Criteria().andOperator(new Criteria("dateFrom").lte(date),
                new Criteria("dateTo").gte(date)));
        return template.findOne(q, KidCalAssenza.class);
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param date
     * @return
     */
    @Override
    public KidCalRitiro getReturn(String appId, String schoolId, String kidId, long date) {
        Query q = kidQuery(appId, schoolId, kidId);
        addDayCriteria(date, q);
        return template.findOne(q, KidCalRitiro.class);
    }

    @Override
    public List<KidCalRitiro> getReturn(String appId, String schoolId, String kidId, long dateFrom,
            long dateTo) {
        Query q = kidQuery(appId, schoolId, kidId);
        long dateTimestampFrom = timestampToDate(dateFrom);
        long dateTimestampTo = timestampToDate(dateTo);
        q.addCriteria(new Criteria().andOperator(new Criteria("date").gte(dateTimestampFrom),
                new Criteria("date").lte(dateTimestampTo)));
        return template.find(q, KidCalRitiro.class);
    }

    /**
     * @param absence
     * @return
     */
    @Override
    public KidConfig saveAbsence(KidCalAssenza absence) {
        Query q = kidQuery(absence.getAppId(), absence.getSchoolId(), absence.getKidId());
        q.addCriteria(
                new Criteria().andOperator(new Criteria("dateFrom").gte(absence.getDateFrom()),
                        new Criteria("dateTo").lte(absence.getDateTo())));
        template.remove(q, KidCalAssenza.class);

        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(absence.getDateFrom());
        while (c.getTimeInMillis() <= absence.getDateTo()) {
            c.set(Calendar.MILLISECOND, 0);
            c.set(Calendar.SECOND, 0);
            c.set(Calendar.MINUTE, 0);
            c.set(Calendar.HOUR, 0);
            Date startDay = c.getTime();
            c.set(Calendar.MILLISECOND, 0);
            c.set(Calendar.SECOND, 59);
            c.set(Calendar.MINUTE, 59);
            c.set(Calendar.HOUR, 23);
            Date endDay = c.getTime();

            // delete bus stop and ritiro for that day
            q = kidQuery(absence.getAppId(), absence.getSchoolId(), absence.getKidId());
            // q.addCriteria(new Criteria("date").is(c.getTimeInMillis()));
            q.addCriteria(new Criteria().andOperator(new Criteria("date").gte(startDay.getTime()),
                    new Criteria("date").lte(endDay.getTime())));
            template.remove(q, KidCalFermata.class);
            template.remove(q, KidCalRitiro.class);

            KidCalAssenza copy = absence.copy();
            copy.setDateFrom(startDay.getTime());
            copy.setDateTo(endDay.getTime());
            template.save(copy);
            c.setTimeInMillis(startDay.getTime());
            c.add(Calendar.DATE, 1);
        }
        return getKidConfig(absence.getAppId(), absence.getSchoolId(), absence.getKidId());
    }

    /**
     * @param ritiro
     * @return
     */
    @Override
    public KidConfig saveReturn(KidCalRitiro ritiro) {
        Query q = kidQuery(ritiro.getAppId(), ritiro.getSchoolId(), ritiro.getKidId());

        addDayCriteria(ritiro.getDate(), q);
        template.remove(q, KidCalRitiro.class);

        // delete bus stop for that day
        q = kidQuery(ritiro.getAppId(), ritiro.getSchoolId(), ritiro.getKidId());
        q.addCriteria(new Criteria("date").is(timestampToDate(ritiro.getDate())));
        template.remove(q, KidCalFermata.class);
        // delete ansence for that date
        q = kidQuery(ritiro.getAppId(), ritiro.getSchoolId(), ritiro.getKidId());
        // q.addCriteria(new
        // Criteria("dateFrom").is(timestampToDate(ritiro.getDate())));
        q.addCriteria(new Criteria().andOperator(new Criteria("dateFrom").lte(ritiro.getDate()),
                new Criteria("dateTo").gte(ritiro.getDate())));
        template.remove(q, KidCalAssenza.class);

        template.save(ritiro);
        return getKidConfig(ritiro.getAppId(), ritiro.getSchoolId(), ritiro.getKidId());
    }

    private void addDayCriteria(long date, Query q) {
        long dateTimestamp = timestampToDate(date);
        q.addCriteria(new Criteria().andOperator(new Criteria("date").gte(dateTimestamp),
                new Criteria("date").lt(dateTimestamp + 1000 * 60 * 60 * 24)));
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param date
     * @return
     */
    @Override
    public List<KidCalNote> getKidCalNotes(String appId, String schoolId, String kidId, long date) {
        Query q = kidQuery(appId, schoolId, kidId);
        q.addCriteria(new Criteria("date").is(timestampToDate(date)));
        q.with(new Sort(Sort.Direction.DESC, "date"));
        List<KidCalNote> noteList = template.find(q, KidCalNote.class);
        for (KidCalNote kidCalNote : noteList) {
            List<Note> parentNotes = kidCalNote.getParentNotes();
            sortNotes(parentNotes);
            List<Note> schoolNotes = kidCalNote.getSchoolNotes();
            sortNotes(schoolNotes);
        }
        return noteList;
    }

    /**
     * @param appId
     * @param schoolId
     * @param sectionIds
     * @param date
     * @return
     */
    @Override
    public List<KidCalNote> getKidCalNotesForSection(String appId, String schoolId,
            String[] sectionIds, long date) {
        Query q = schoolQuery(appId, schoolId);
        if (sectionIds != null) {
            q.addCriteria(new Criteria("section.sectionId").in((Object[]) sectionIds));
        }
        q.fields().include("kidId");
        List<KidProfile> profiles = template.find(q, KidProfile.class);
        List<String> kids = new ArrayList<String>();
        for (KidProfile profile : profiles)
            kids.add(profile.getKidId());

        q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("kidId").in(kids));
        q.addCriteria(new Criteria("date").is(timestampToDate(date)));
        return template.find(q, KidCalNote.class);
    }

    /**
     * @param note
     */
    @Override
    public KidCalNote saveNote(KidCalNote note) {
        KidCalNote result = null;
        Query q = kidQuery(note.getAppId(), note.getSchoolId(), note.getKidId());
        q.addCriteria(new Criteria("date").is(timestampToDate(note.getDate())));
        KidCalNote old = template.findOne(q, KidCalNote.class);
        if (old != null) {
            old.merge(note);
            template.save(old);
            result = old;
        } else {
            note.setDate(timestampToDate(note.getDate()));
            template.save(note);
            result = note;
        }
        List<Note> parentNotes = result.getParentNotes();
        sortNotes(parentNotes);
        List<Note> schoolNotes = result.getSchoolNotes();
        sortNotes(schoolNotes);
        return result;
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
        return weekDefault;
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
        List<KidProfile.DayDefault> days = week.getDays();
        return days;
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
        return template.find(schoolQuery(appId, schoolId), Communication.class);
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    @Override
    public List<Communication> getKidCommunications(String appId, String schoolId, String kidId) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("children").is(kidId));
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
     * @param comm
     * @return
     */
    @Override
    public InternalNote saveInternalNote(InternalNote comm) {
        comm.setDate(timestampToDate(comm.getDate()));
        template.insert(comm);
        return comm;
    }

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    @Override
    public List<InternalNote> getInternalNotes(String appId, String schoolId, String[] sectionIds,
            long date) {
        Query q = schoolQuery(appId, schoolId);
        if (sectionIds != null && sectionIds.length > 0) {
            q.addCriteria(new Criteria("section.sectionId").in((Object[]) sectionIds));
            q.fields().include("kidId");
            List<KidProfile> profiles = template.find(q, KidProfile.class);
            Set<String> ids = new HashSet<String>();
            for (KidProfile kp : profiles)
                ids.add(kp.getKidId());

            q = schoolQuery(appId, schoolId);
            q.addCriteria(new Criteria("date").is(timestampToDate(date)));
            q.addCriteria(
                    new Criteria().orOperator(new Criteria("sectionIds").in((Object[]) sectionIds),
                            new Criteria("kidIds").in(ids)));
            q.with(new Sort(Sort.Direction.DESC, "date"));
            return template.find(q, InternalNote.class);
        } else {
            q.addCriteria(new Criteria("date").is(timestampToDate(date)));
            q.with(new Sort(Sort.Direction.DESC, "date"));
            return template.find(q, InternalNote.class);
        }
    }

    /**
     * @param appId
     * @param schoolId
     * @param from
     * @param to
     * @return
     */
    @Override
    public List<Menu> getMeals(String appId, String schoolId, long from, long to) {
        // TODO
        return DumpDataHelper.dummyMenu(appId, schoolId);

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
        // q.addCriteria(new Criteria("dateFrom").is(timestampToDate(date)));
        List<KidBusData> kidBusData = template.find(q, KidBusData.class);
        ListMultimap<String, BusData.KidProfile> mm = ArrayListMultimap.create();

        Map<String, KidCalAssenza> assenzeMap = readAssenze(appId, schoolId, date);
        Map<String, KidCalRitiro> ritiriMap = readRitiri(appId, schoolId, date);
        Map<String, KidCalFermata> stopsMap = readFermate(appId, schoolId, date);

        for (KidBusData kbd : kidBusData) {
            BusData.KidProfile busKidProfile = new BusData.KidProfile();
            KidProfile kp = getKidProfile(appId, schoolId, kbd.getKidId());
            KidConfig conf = getKidConfig(appId, schoolId, kbd.getKidId());

            busKidProfile.setFullName(kp.getFullName());
            busKidProfile.setImage(kp.getImage());
            busKidProfile.setKidId(kbd.getKidId());

            KidCalAssenza assenza = assenzeMap.get(kbd.getKidId());
            if (conf != null && !conf.getServices().getBus().isActive() || assenza != null) {
                busKidProfile.setVariation(true);
                busKidProfile.setBusStop(null);
            } else {
                KidCalFermata stop = stopsMap.get(kp.getKidId());
                String personId = null;
                if (stop != null) {
                    busKidProfile.setVariation(true);
                    busKidProfile.setBusStop(stop.getStopId());
                    personId = stop.getPersonId();
                } else {
                    KidCalRitiro ritiro = ritiriMap.get(kp.getKidId());
                    if (ritiro != null) {
                        busKidProfile.setVariation(true);
                        busKidProfile.setBusStop(null);
                    } else {
                        personId = conf != null ? conf.getDefaultPerson() : findDefaultPerson(kp);
                        busKidProfile.setBusStop(
                                conf != null ? conf.getServices().getBus().getDefaultIdBack()
                                        : kp.getServices().getBus().getStops().get(0).getStopId());
                    }
                }
                if (personId != null) {
                    busKidProfile.setPersonWhoWaitId(personId);
                    AuthPerson ap = getPerson(personId, conf, kp);
                    busKidProfile.setPersonWhoWaitName(ap.getFullName());
                    busKidProfile.setPersonWhoWaitRelation(ap.getRelation());
                }
            }
            mm.put(kbd.getBusId(), busKidProfile);
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
    public List<SectionData> getSections(String appId, String schoolId, Collection<String> sections,
            long date) {
        SchoolProfile profile = getSchoolProfile(appId, schoolId);
        Date today = new Date();
        Calendar cal = Calendar.getInstance();
        cal.setTime(today);
        int weeknr = cal.get(Calendar.WEEK_OF_YEAR);
        int daynr = cal.get(Calendar.DAY_OF_WEEK) - 1;
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

        List<KidProfile> kids = readKidsForSections(appId, schoolId, sections);
        Set<TimeSlotSchoolService> schoolProfileServices = profile.getServices();
        TimeSlotSchoolService regularService = new TimeSlotSchoolService("test", true);
        for (TimeSlotSchoolService ts : schoolProfileServices) {
            if (ts.isRegular()) {
                regularService = ts;
                break;
            }
        }
        // Map<String, KidCalAssenza> assenzeMap = readAssenze(appId, schoolId, date);
        // Map<String, KidCalRitiro> ritiriMap = readRitiri(appId, schoolId, date);
        // Map<String, KidCalFermata> stopsMap = readFermate(appId, schoolId, date);
        // Map<String, KidConfig> configMap = readConfigurations(appId, schoolId);


        for (KidProfile kp : kids) {
            // KidConfig conf = configMap.get(kp.getKidId());
            KidServices kidServices = kp.getServices();
            List<String> allKidFascie = new ArrayList<String>();
            List<TimeSlotSchoolService.ServiceTimeSlot> allFascie =
                    new ArrayList<TimeSlotSchoolService.ServiceTimeSlot>();
            if (kidServices.getTimeSlotServices() != null) {
                for (TimeSlotSchoolService ts : kidServices.getTimeSlotServices()) {
                    if (ts.isEnabled()) {
                        for (TimeSlotSchoolService.ServiceTimeSlot fasc : ts.getTimeSlots()) {
                            allKidFascie.add(fasc.getName());
                            allFascie.add(fasc);
                        }
                    }
                }
            }
            List<DayDefault> defaultWeek = kp.getWeekDef();
            KidWeeks kidWeekConfig = readKidWeeks(appId, schoolId, kp.getKidId(), weeknr);
            DayDefault todayConfig = null;

            // get the configuration from the regular school service
            todayConfig = new DayDefault();
            todayConfig.setAbsence(false);
            ServiceTimeSlot ts = regularService.getTimeSlots().get(0);
            todayConfig.setEntrata(ts.getFromTime().getMillis());
            todayConfig.setUscita(ts.getToTime().getMillis());
            todayConfig.setBus(false);


            // get Day info from KidWeeks if there is an exception configuration
            if (kidWeekConfig != null) {
                List<DayDefault> days = kidWeekConfig.getDays();
                todayConfig = days.get(daynr);
            } else if (defaultWeek != null) {
                // get DayInfo from WeekDefault of the kid if there is any default
                // configuration for kid
                todayConfig = defaultWeek.get(daynr);
            } else if (kidServices != null && allFascie.size() > 0) {
                // get the configuration from the services of kid
                todayConfig.setAbsence(false);
                sortFascieEntry(allFascie); // sort fascie and get the min value to define the entry
                                            // time
                if (allFascie.get(0).getFromTime()
                        .isBefore(regularService.getTimeSlots().get(0).getFromTime())) {
                    todayConfig.setEntrata(allFascie.get(0).getFromTime().getMillis());
                }
                sortFascieExit(allFascie); // sort fascie and get the max value to define the exit
                                           // time
                if (allFascie.get(allFascie.size() - 1).getToTime()
                        .isAfter(regularService.getTimeSlots().get(0).getToTime())) {
                    todayConfig
                            .setUscita(allFascie.get(allFascie.size() - 1).getToTime().getMillis());
                }
                todayConfig.setBus(kidServices.getBus().isEnabled());
            }

            SectionData.KidProfile skp = new SectionData.KidProfile();
            skp.setKidId(kp.getKidId());
            skp.setChildrenName(kp.getFullName());
            skp.setImage(kp.getImage());
            skp.setActive(kp.isActive());
            skp.setBus(new ServiceProfile(todayConfig.getBus(), todayConfig.getBus()));
            skp.setfascieNames(allKidFascie);
            skp.setfascieList(allFascie);

            // merge service state from kidProfile Serivces or from schoolProfile
            skp.setServices(kp.getServices());
            /*
             * skp.setAnticipo(new ServiceProfile(kp.getServices().getAnticipo().isEnabled(), conf
             * != null ? conf.anticipoActive() : true)); skp.setPosticipo(new
             * ServiceProfile(kp.getServices().getPosticipo().isEnabled(), conf != null ?
             * conf.posticipoActive() : true)); skp.setMensa(new
             * ServiceProfile(kp.getServices().getMensa().isEnabled(), conf != null ?
             * conf.mensaActive() : true)); skp.setBus(new
             * ServiceProfile(kp.getServices().getBus().isEnabled(), conf != null ? conf.busActive()
             * : true));
             */
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
            /*
             * if (assenzeMap.containsKey(kp.getKidId())) { KidCalAssenza a =
             * assenzeMap.get(kp.getKidId()); skp.setExitTime(null); skp.setNote(a.getNote()); if
             * (a.getReason() != null) { skp.setAbsenceType(a.getReason().getType());
             * skp.setAbsenceSubtype(a.getReason().getSubtype()); } } else if
             * (ritiriMap.containsKey(kp.getKidId())) { KidCalRitiro r =
             * ritiriMap.get(kp.getKidId()); skp.setExitTime(r.getDate()); } else {
             * skp.setExitTime(computeTime(date, conf, kp, profile)); }
             */

            // read from ritiro object
            String personId = todayConfig.getDelega_name();
            /*
             * if (ritiriMap.containsKey(kp.getKidId())) { KidCalRitiro r =
             * ritiriMap.get(kp.getKidId()); skp.setPersonException(r.isExceptional());
             * skp.setNote(r.getNote()); personId = r.getPersonId(); } // if no explicit return,
             * read stop from stop object, otherwise from // config, otherwise // from profile else
             * if (skp.getBus().isActive()) { if (stopsMap.containsKey(kp.getKidId())) {
             * KidCalFermata fermata = stopsMap.get(kp.getKidId()); skp.setNote(fermata.getNote());
             * skp.setStopId(fermata.getStopId()); skp.setStopException(true); personId =
             * fermata.getPersonId(); } else { skp.setStopId(conf != null ?
             * conf.getServices().getBus().getDefaultIdBack() :
             * kp.getServices().getBus().getStops().get(0).getStopId()); } }
             */

            if (personId == null) {
                personId = findDefaultPerson(kp);
            }

            skp.setPersonId(personId);
            // skp.setPersonName(getPerson(personId, conf, kp).getFullName());

            // set if extist some KidCalNote
            List<KidCalNote> list = getKidCalNotes(appId, schoolId, skp.getKidId(), date);
            if ((list != null) && (list.size() > 0)) {
                skp.setCalNotes(true);
            } else {
                skp.setCalNotes(false);
            }
            map.get(kp.getSection().getSectionId()).getChildren().add(skp);
        }

        return new ArrayList<SectionData>(map.values());
    }

    private KidWeeks readKidWeeks(String appId, String schoolId, String kidId, int weeknr) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("kidId").is(kidId).and("weeknr").is(weeknr));
        KidWeeks kidWeek = template.findOne(q, KidWeeks.class);

        return kidWeek;
    }

    public void sortFascieEntry(List<TimeSlotSchoolService.ServiceTimeSlot> allFascie) {
        if ((allFascie != null) && (allFascie.size() > 0)) {
            // order notes inside
            Comparator<TimeSlotSchoolService.ServiceTimeSlot> comparator =
                    new Comparator<TimeSlotSchoolService.ServiceTimeSlot>() {
                        @Override
                        public int compare(TimeSlotSchoolService.ServiceTimeSlot o1,
                                TimeSlotSchoolService.ServiceTimeSlot o2) {
                            DateTime date1 = new DateTime(o1.getFromTime());
                            DateTime date2 = new DateTime(o2.getFromTime());
                            return date2.compareTo(date1);
                        }
                    };
            Collections.sort(allFascie, comparator);
        }
    }

    public void sortFascieExit(List<TimeSlotSchoolService.ServiceTimeSlot> allFascie) {
        if ((allFascie != null) && (allFascie.size() > 0)) {
            // order notes inside
            Comparator<TimeSlotSchoolService.ServiceTimeSlot> comparator =
                    new Comparator<TimeSlotSchoolService.ServiceTimeSlot>() {
                        @Override
                        public int compare(TimeSlotSchoolService.ServiceTimeSlot o1,
                                TimeSlotSchoolService.ServiceTimeSlot o2) {
                            DateTime date1 = new DateTime(o1.getToTime());
                            DateTime date2 = new DateTime(o2.getToTime());
                            return date2.compareTo(date1);
                        }
                    };
            Collections.sort(allFascie, comparator);
        }
    }

    private Map<String, KidConfig> readConfigurations(String appId, String schoolId) {
        Query q = schoolQuery(appId, schoolId);
        List<KidConfig> configs = template.find(q, KidConfig.class);
        Map<String, KidConfig> configMap = new HashMap<String, KidConfig>();
        for (KidConfig c : configs) {
            configMap.put(c.getKidId(), c);
        }
        return configMap;
    }

    private Map<String, KidCalFermata> readFermate(String appId, String schoolId, long date) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria("date").is(timestampToDate(date)));
        List<KidCalFermata> stops = template.find(q, KidCalFermata.class);
        Map<String, KidCalFermata> stopsMap = new HashMap<String, KidCalFermata>();
        for (KidCalFermata s : stops) {
            stopsMap.put(s.getKidId(), s);
        }
        return stopsMap;
    }

    private Map<String, KidCalRitiro> readRitiri(String appId, String schoolId, long date) {
        Query q = schoolQuery(appId, schoolId);
        addDayCriteria(date, q);

        List<KidCalRitiro> ritiri = template.find(q, KidCalRitiro.class);
        Map<String, KidCalRitiro> ritiriMap = new HashMap<String, KidCalRitiro>();
        for (KidCalRitiro r : ritiri) {
            ritiriMap.put(r.getKidId(), r);
        }
        return ritiriMap;
    }

    private Map<String, KidCalAssenza> readAssenze(String appId, String schoolId, long date) {
        Query q = schoolQuery(appId, schoolId);
        q.addCriteria(new Criteria().andOperator(new Criteria("dateFrom").lte(date),
                new Criteria("dateTo").gte(date)));
        List<KidCalAssenza> assenze = template.find(q, KidCalAssenza.class);
        Map<String, KidCalAssenza> assenzeMap = new HashMap<String, KidCalAssenza>();
        for (KidCalAssenza a : assenze) {
            assenzeMap.put(a.getKidId(), a);
        }
        return assenzeMap;
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
        return kp.getPersons().get(0).getPersonId();
    }

    /**
     * @param personId
     * @param conf
     * @param kp
     * @return
     */
    private AuthPerson getPerson(String personId, KidConfig conf, KidProfile kp) {
        for (AuthPerson ap : kp.getPersons()) {
            if (ap.getPersonId().equals(personId))
                return ap;
        }
        if (conf != null && conf.getExtraPersons() != null) {
            for (AuthPerson ap : conf.getExtraPersons()) {
                if (ap.getPersonId().equals(personId))
                    return ap;
            }
        }
        personId = conf != null ? conf.getDefaultPerson() : findDefaultPerson(kp);
        for (AuthPerson ap : kp.getPersons()) {
            if (ap.getPersonId().equals(personId))
                return ap;
        }

        return null;
    }

    /**
     * @param appId
     * @param schoolId
     * @return
     */
    @Override
    public List<TeacherCalendar> getTeacherCalendar(String appId, String schoolId, long from,
            long to) {
        // TODO
        return DumpDataHelper.dummyTecherCalendar(appId, schoolId);
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
     * @param appId
     * @param schoolId
     * @param busData
     */
    @Override
    public void updateKidBusData(String appId, String schoolId, List<KidBusData> busData) {
        template.remove(schoolQuery(appId, schoolId), KidBusData.class);
        template.insertAll(busData);
    }

    /**
     * @param date
     * @param kidConfig
     * @param kp
     * @return
     */
    private Long computeTime(long date, KidConfig kidConfig, KidProfile kp, SchoolProfile profile) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(date);

        String exit = kp.getServices().getPosticipo().isEnabled()
                ? profile.getPosticipoTiming().getToTime()
                : profile.getPosticipoTiming().getFromTime();

        if (kidConfig != null) {
            exit = kidConfig.getExitTime();
        }

        try {
            Date timeDate = TIME_FORMAT.parse(exit);
            Calendar tc = Calendar.getInstance();
            tc.setTime(timeDate);
            c.set(Calendar.HOUR_OF_DAY, tc.get(Calendar.HOUR_OF_DAY));
            c.set(Calendar.MINUTE, tc.get(Calendar.MINUTE));
            return c.getTimeInMillis();

        } catch (ParseException e) {
            e.printStackTrace();
            return date;
        }
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
        q.addCriteria(new Criteria("username").is(username));
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

    @Override
    public void sortNotes(List<Note> notes) {
        if ((notes != null) && (notes.size() > 0)) {
            // order notes inside
            Comparator<Note> comparator = new Comparator<Note>() {
                @Override
                public int compare(Note o1, Note o2) {
                    Long date1 = new Long(o1.getDate());
                    Long date2 = new Long(o2.getDate());
                    return date2.compareTo(date1);
                }
            };
            Collections.sort(notes, comparator);
        }
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
        q.addCriteria(new Criteria("personId").is(personId));
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
    public List<UsageEntity> findUsageEntities(String appId, String schoolId, UsageAction action,
            UsageActor from, UsageActor to, Object extra, Long fromTime, Long toTime) {
        Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId);
        if (action != null) {
            criteria = criteria.and("action").is(action);
        }
        if (from != null) {
            criteria = criteria.and("from").is(from);
        }
        if (to != null) {
            criteria = criteria.and("to").is(from);
        }
        if (extra != null) {
            criteria = criteria.and("extra").is(extra);
        }

        Criteria range = null;
        if (fromTime != null) {
            range = new Criteria("timestamp").gte(fromTime);
        }
        if (toTime != null) {
            if (range == null) {
                range = new Criteria("timestamp");
            }
            range = range.lte(toTime);
        }
        if (range != null) {
            criteria = criteria.andOperator(range);
        }

        Query query = new Query(criteria).with(new Sort(Sort.Direction.ASC, "timestamp"));

        List<UsageEntity> results = template.find(query, UsageEntity.class);

        return results;
    }

    @Override
    public long countUsageEntities(String appId, String schoolId, UsageAction action,
            UsageActor from, UsageActor to, Object extra, Long fromTime, Long toTime) {
        Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId);
        if (action != null) {
            criteria = criteria.and("action").is(action);
        }
        if (from != null) {
            criteria = criteria.and("from").is(from);
        }
        if (to != null) {
            criteria = criteria.and("to").is(from);
        }
        if (extra != null) {
            criteria = criteria.and("extra").is(extra);
        }

        Criteria range = null;
        if (fromTime != null) {
            range = new Criteria("timestamp").gte(fromTime);
        }
        if (toTime != null) {
            if (range == null) {
                range = new Criteria("timestamp");
            }
            range = range.lte(toTime);
        }
        if (range != null) {
            criteria = criteria.andOperator(range);
        }

        Query query = new Query(criteria);

        long resultN = template.count(query, UsageEntity.class);

        return resultN;
    }

    @Override
    public KidProfile updateKid(KidProfile kid) {
        Criteria criteria =
                new Criteria("appId").is(kid.getAppId()).and("schoolId").is(kid.getSchoolId());
        criteria.and("kidId").is(kid.getKidId());
        Query q = new Query(criteria);
        DBObject dbObject = new BasicDBObject();
        template.getConverter().write(kid, dbObject);
        Update updateDoc = Update.fromDBObject(dbObject);
        return template.findAndModify(q, updateDoc, KidProfile.class);

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
