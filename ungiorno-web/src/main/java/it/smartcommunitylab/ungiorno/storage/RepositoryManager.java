/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package it.smartcommunitylab.ungiorno.storage;

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.diary.model.DiaryEntry;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKid;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKid.DiaryKidPerson;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKidProfile;
import it.smartcommunitylab.ungiorno.diary.model.DiaryTeacher;
import it.smartcommunitylab.ungiorno.diary.model.MultimediaEntry;
import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.Bus;
import it.smartcommunitylab.ungiorno.model.BusData;
import it.smartcommunitylab.ungiorno.model.CalendarItem;
import it.smartcommunitylab.ungiorno.model.ChatMessage;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.Group;
import it.smartcommunitylab.ungiorno.model.InternalNote;
import it.smartcommunitylab.ungiorno.model.KidBusData;
import it.smartcommunitylab.ungiorno.model.KidCalAssenza;
import it.smartcommunitylab.ungiorno.model.KidCalNote;
import it.smartcommunitylab.ungiorno.model.KidCalNote.Note;
import it.smartcommunitylab.ungiorno.model.KidCalRitiro;
import it.smartcommunitylab.ungiorno.model.KidConfig;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Menu;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.Person;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SchoolUser;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.SectionData.ServiceProfile;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TeacherCalendar;
import it.smartcommunitylab.ungiorno.utils.Utils;

import java.io.File;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import com.google.common.collect.Lists;

@Component
public class RepositoryManager {

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
	public void createApp(AppInfo info) {
		App app = getApp(info.getAppId());
		if (app == null) {
			App appDescr = new App();
			appDescr.setAppInfo(info);
			template.save(appDescr);
		}

	}

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
		return new Query(new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("kidId").is(kidId));
	}

	/**
	 * @param profile
	 */
	public void storeSchoolProfile(SchoolProfile profile) {
		SchoolProfile old = template.findOne(schoolQuery(profile.getAppId(), profile.getSchoolId()), SchoolProfile.class);
		if (old != null) { 
//			profile.set_id(old.get_id());
		}
		template.save(profile);
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @return
	 */
	public SchoolProfile getSchoolProfile(String appId, String schoolId) {
		return template.findOne(schoolQuery(appId, schoolId), SchoolProfile.class);
	}

	/**
	 * @param appId
	 * @param username
	 * @return
	 */
	public SchoolProfile getSchoolProfileForUser(String appId, String username) {
		Query query = Query.query(new Criteria("appId").is(appId).and("username").is(username));
		SchoolUser user = template.findOne(query, SchoolUser.class);
		if (user != null) {
			return getSchoolProfile(appId, user.getSchoolId());
		}
		return null;
	}


	/**
	 * @param appId
	 * @param schoolId
	 * @param children
	 */
	public void updateAuthorizations(String appId, String schoolId, List<KidProfile> children) {
		for (KidProfile kid : children) {
			KidProfile old = template.findOne(kidQuery(appId, schoolId, kid.getKidId()), KidProfile.class);
			if (old != null) {
				Set<String> persons = new HashSet<String>();
//				for (Iterator<AuthPerson> iter = old.getPersons().iterator(); iter.hasNext();) {
//					AuthPerson ap = iter.next();
//					if (!ap.isParent()) iter.remove();
//					else {
//						persons.add(ap.getPersonId());
//					}
//				}
//				for (AuthPerson ap: kid.getPersons()) {
//					if (!persons.contains(ap.getPersonId())) {
//						old.getPersons().add(ap);
//					}
//				}
				template.save(old);
			} else {
				template.insert(kid); 
			}
		}
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param children
	 */
	public void updateChildren(String appId, String schoolId, List<KidProfile> children) {
		template.remove(schoolQuery(appId, schoolId), KidProfile.class);
		template.insertAll(children);
		
		for (KidProfile kp: children) {
			Query q = kidQuery(appId, schoolId, kp.getKidId());
			DiaryKid kid = template.findOne(q, DiaryKid.class);
			if (kid != null) {
				Set<String> existing = new HashSet<String>();
				Set<String> existingTeachers = new HashSet<String>();
				for (DiaryKidPerson p : kid.getPersons()) {
					if (p.isParent()) existing.add(p.getPersonId());
					else existingTeachers.add(p.getPersonId());
				}
				// TODO, currently assume that the kid is not overwritten, add new persons only
//				if (kp.getPersons() != null) {
//					for (AuthPerson ap: kp.getPersons()) {
//						if (!existing.contains(ap.getPersonId())) {
//							kid.getPersons().add(ap.toDiaryKidPerson(true));
//						}
//					}
//				}
				if (kp.getDiaryTeachers() != null) {
					for (DiaryTeacher dt: kp.getDiaryTeachers()) {
						if (!existingTeachers.contains(dt.getTeacherId())) {
//							Teacher teacher = getTeacher(dt.getTeacherId(), appId, schoolId);
//							kid.getPersons().add(teacher.toDiaryKidPerson(true));
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
				
//				if (kp.getPersons() != null) {
//					for (AuthPerson ap: kp.getPersons()) {
//						dk.getPersons().add(ap.toDiaryKidPerson(true));
//					}
//				} else {
//					logger.error("No persons for kid "+ kp.getKidId());
//				}
				if (kp.getDiaryTeachers() != null) {
					for (DiaryTeacher dt: kp.getDiaryTeachers()) {
//						Teacher teacher = getTeacher(dt.getTeacherId(), appId, schoolId);
//						dk.getPersons().add(teacher.toDiaryKidPerson(true));
					}			
				}
				template.insert(dk);
			}
			
		}
	}
	/**
	 * @param appId
	 * @param schoolId
	 * @param parents
	 */
	public void updateParents(String appId, List<Parent> parents) {
		template.remove(appQuery(appId), Parent.class);
		template.insertAll(parents);
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param teachers
	 */
	public void updateTeachers(String appId, String schoolId, List<Teacher> teachers) {
		template.remove(schoolQuery(appId, schoolId), Teacher.class);
		template.insertAll(teachers);
	}
	/**
	 * @param appId
	 * @param schoolId
	 */
	public List<DiaryKid> updateDiaryKidPersons(String appId, String schoolId) {
		List<DiaryKid> result = new ArrayList<DiaryKid>();
		List<KidProfile> profiles = template.find(schoolQuery(appId, schoolId), KidProfile.class);
		List<Teacher> teachers = getTeachers(appId, schoolId);
		for (KidProfile kp: profiles) {
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
					};
				}
				// TODO, currently assume that the kid is not overwritten, add new persons only
//				if (kp.getPersons() != null) {
//					for (AuthPerson ap: kp.getPersons()) {
//						if (!existing.contains(ap.getPersonId())) {
//							diaryKid.getPersons().add(ap.toDiaryKidPerson(true));
//						}
//					}
//				}
//				for(Teacher teacher : teachers) {
//					if(teacher.getSectionIds().contains(kp.getSection().getSectionId())) {
//						if(!existingTeachers.contains(teacher.getTeacherId())) {
//							diaryKid.getPersons().add(teacher.toDiaryKidPerson(true));
//						}
//					}
//				}
				/*if (kp.getDiaryTeachers() != null) {
					for (DiaryTeacher dt: kp.getDiaryTeachers()) {
						if (!existingTeachers.contains(dt.getTeacherId())) {
							Teacher teacher = getTeacher(dt.getTeacherId(), appId, schoolId);
							diaryKid.getPersons().add(teacher.toDiaryKidPerson(true));
						}
					}			
				}*/
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
				
//				if (kp.getPersons() != null) {
//					for (AuthPerson ap: kp.getPersons()) {
//						if((ap.getPersonId() == null) || (ap.getPersonId().equals(""))) {
//							continue;
//						}
//						dk.getPersons().add(ap.toDiaryKidPerson(true));
//					}
//				} else {
//					logger.error("No persons for kid "+ kp.getKidId());
//				}
//				for(Teacher teacher : teachers) {
//					if(teacher.getSectionIds().contains(kp.getSection().getSectionId())) {
//						dk.getPersons().add(teacher.toDiaryKidPerson(true));
//					}
//				}
				/*if (kp.getDiaryTeachers() != null) {
					for (DiaryTeacher dt: kp.getDiaryTeachers()) {
						Teacher teacher = getTeacher(dt.getTeacherId(), appId, schoolId);
						dk.getPersons().add(teacher.toDiaryKidPerson(true));
					}			
				}*/
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
	public List<CalendarItem> getCalendar(String appId, String schoolId, String kidId, long from, long to) {
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
	public KidProfile getKidProfile(String appId, String schoolId, String kidId) {
		return template.findOne(kidQuery(appId, schoolId, kidId), KidProfile.class);
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @return
	 */
	public KidConfig getKidConfig(String appId, String schoolId, String kidId) {
		return template.findOne(kidQuery(appId, schoolId, kidId), KidConfig.class);
	}

	/**
	 * @param config
	 * @return
	 */
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
	public List<KidProfile> getKidProfilesByParent(String appId, String username) throws ProfileNotFoundException {
		Query q = appQuery(appId);
		q.addCriteria(new Criteria("username").is(username));
		Parent p = template.findOne(q, Parent.class);
		if(p == null) {
			throw new ProfileNotFoundException("Profile not found");
		}
		
		q = appQuery(appId);
		q.addCriteria(new Criteria("persons").elemMatch(new Criteria("personId").is(p.getPersonId()).and("parent").is(true)));
		return template.find(q, KidProfile.class);
	}
	
	/**
	 * @param appId
	 * @param username
	 * @return
	 */
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
	 * @param username
	 * @return
	 */
	public List<DiaryKidProfile> getDiaryKidProfilesByAuthId(String appId, String schoolId, String authId, boolean isTeacher) {
		Query q = schoolId == null ? appQuery(appId) : schoolQuery(appId, schoolId);
		q.addCriteria(new Criteria("persons").elemMatch(new Criteria("personId").is(authId).and("parent").is(!isTeacher)));
		List<DiaryKid> kids = template.find(q, DiaryKid.class);
		List<DiaryKidProfile> profiles = new ArrayList<DiaryKidProfile>();
		for (DiaryKid kid : kids) {
			DiaryKidProfile p = new DiaryKidProfile();
			p.setAppId(kid.getAppId());
			p.setSchoolId(kid.getSchoolId());
			p.setKidId(kid.getKidId());
			p.setAuthorizedPersonsIds(new ArrayList<String>());
			for (DiaryKidPerson ap : kid.getPersons()) {
				if (ap.isAuthorized()) p.getAuthorizedPersonsIds().add(ap.getPersonId());
			}
			profiles.add(p);
		}
		return profiles;
	}	
	

	/**
	 * @param stop
	 * @return
	 */
//	public KidConfig saveStop(KidCalFermata stop) {
//		stop.setDate(timestampToDate(stop.getDate()));
//		Query q = kidQuery(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
//		q.addCriteria(new Criteria("date").is(stop.getDate()));
//		template.remove(q, KidCalFermata.class);
//		
//		// delete direct ritiro
//		q = kidQuery(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
//		addDayCriteria(stop.getDate(), q);
//		template.remove(q, KidCalRitiro.class);
//		// delete absence for that date
//		q = kidQuery(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
//		q.addCriteria(new Criteria("dateFrom").is(stop.getDate()));
//		template.remove(q, KidCalAssenza.class);
//		
//		template.save(stop);
//		return getKidConfig(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
//	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @param date
	 * @return
	 */
//	public KidCalFermata getStop(String appId, String schoolId, String kidId, long date) {
//		Query q = kidQuery(appId, schoolId, kidId);
//		q.addCriteria(new Criteria("date").is(timestampToDate(date)));
//		return template.findOne(q, KidCalFermata.class);
//	}

//	public List<KidCalFermata> getStop(String appId, String schoolId, String kidId, long dateFrom, long dateTo) {
//		Query q = kidQuery(appId, schoolId, kidId);
//		long dateTimestampFrom = timestampToDate(dateFrom);
//		long dateTimestampTo = timestampToDate(dateTo);
//		q.addCriteria(new Criteria().andOperator(
//				new Criteria("date").gte(dateTimestampFrom),
//				new Criteria("date").lte(dateTimestampTo)));
//		return template.find(q, KidCalFermata.class);
//	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @param date
	 * @return
	 */
	public KidCalAssenza getAbsence(String appId, String schoolId, String kidId, long date) {
		Query q = kidQuery(appId, schoolId, kidId);
		q.addCriteria(new Criteria().andOperator(
				new Criteria("dateFrom").lte(date),
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
	public KidCalRitiro getReturn(String appId, String schoolId, String kidId, long date) {
		Query q = kidQuery(appId, schoolId, kidId);
		addDayCriteria(date, q);
		return template.findOne(q, KidCalRitiro.class);
	}

	public List<KidCalRitiro> getReturn(String appId, String schoolId, String kidId, long dateFrom, long dateTo) {
		Query q = kidQuery(appId, schoolId, kidId);
		long dateTimestampFrom = timestampToDate(dateFrom);
		long dateTimestampTo = timestampToDate(dateTo);
		q.addCriteria(new Criteria().andOperator(
				new Criteria("date").gte(dateTimestampFrom),
				new Criteria("date").lte(dateTimestampTo)));
		return template.find(q, KidCalRitiro.class);
	}

	/**
	 * @param absence
	 * @return
	 */
//	public KidConfig saveAbsence(KidCalAssenza absence) {
//		Query q = kidQuery(absence.getAppId(), absence.getSchoolId(), absence.getKidId());
//		q.addCriteria(new Criteria().andOperator(
//				new Criteria("dateFrom").gte(absence.getDateFrom()),
//				new Criteria("dateTo").lte(absence.getDateTo())));
//		template.remove(q, KidCalAssenza.class);
//		
//		Calendar c = Calendar.getInstance();
//		c.setTimeInMillis(absence.getDateFrom());
//		while (c.getTimeInMillis() <= absence.getDateTo()) {
//			c.set(Calendar.MILLISECOND, 0);
//	    c.set(Calendar.SECOND, 0);
//	    c.set(Calendar.MINUTE, 0);
//	    c.set(Calendar.HOUR, 0);
//			Date startDay = c.getTime();
//			c.set(Calendar.MILLISECOND, 0);
//	    c.set(Calendar.SECOND, 59);
//	    c.set(Calendar.MINUTE, 59);
//	    c.set(Calendar.HOUR, 23);
//			Date endDay = c.getTime();
//			
//			// delete bus stop and ritiro for that day
//			q = kidQuery(absence.getAppId(), absence.getSchoolId(), absence.getKidId());
//			//q.addCriteria(new Criteria("date").is(c.getTimeInMillis()));
//			q.addCriteria(new Criteria().andOperator(
//					new Criteria("date").gte(startDay.getTime()),
//					new Criteria("date").lte(endDay.getTime())));
//			template.remove(q, KidCalFermata.class);
//			template.remove(q, KidCalRitiro.class);
//
//			KidCalAssenza copy = absence.copy();
//			copy.setDateFrom(startDay.getTime());
//			copy.setDateTo(endDay.getTime());
//			template.save(copy);
//			c.setTimeInMillis(startDay.getTime());
//			c.add(Calendar.DATE, 1);
//		}
//		return getKidConfig(absence.getAppId(), absence.getSchoolId(), absence.getKidId());
//	}

	/**
	 * @param ritiro
	 * @return
	 */
	public KidConfig saveReturn(KidCalRitiro ritiro) {
		Query q = kidQuery(ritiro.getAppId(), ritiro.getSchoolId(), ritiro.getKidId());

		addDayCriteria(ritiro.getDate(), q);
		template.remove(q, KidCalRitiro.class);

		// delete bus stop for that day
		q = kidQuery(ritiro.getAppId(), ritiro.getSchoolId(), ritiro.getKidId());
		q.addCriteria(new Criteria("date").is(timestampToDate(ritiro.getDate())));
//		template.remove(q, KidCalFermata.class);
		// delete ansence for that date
		q = kidQuery(ritiro.getAppId(), ritiro.getSchoolId(), ritiro.getKidId());
		//q.addCriteria(new Criteria("dateFrom").is(timestampToDate(ritiro.getDate())));
		q.addCriteria(new Criteria().andOperator(
				new Criteria("dateFrom").lte(ritiro.getDate()),
				new Criteria("dateTo").gte(ritiro.getDate())));
		template.remove(q, KidCalAssenza.class);

		template.save(ritiro);
		return getKidConfig(ritiro.getAppId(), ritiro.getSchoolId(), ritiro.getKidId());
	}

	private void addDayCriteria(long date, Query q) {
		long dateTimestamp = timestampToDate(date); 
		q.addCriteria(new Criteria().andOperator(
				new Criteria("date").gte(dateTimestamp),
				new Criteria("date").lt(dateTimestamp+1000*60*60*24)));
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @param date
	 * @return
	 */
	public List<KidCalNote> getKidCalNotes(String appId, String schoolId, String kidId, long date) {
		Query q = kidQuery(appId, schoolId, kidId);
		q.addCriteria(new Criteria("date").is(timestampToDate(date)));
		q.with(new Sort(Sort.Direction.DESC, "date"));
		List<KidCalNote> noteList = template.find(q, KidCalNote.class);
		for(KidCalNote kidCalNote : noteList) {
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
	public List<KidCalNote> getKidCalNotesForSection(String appId, String schoolId, String[] sectionIds, long date) {
		Query q = schoolQuery(appId, schoolId);
		if (sectionIds != null) {
			q.addCriteria(new Criteria("section.sectionId").in((Object[])sectionIds));
		}
		q.fields().include("kidId");
		List<KidProfile> profiles = template.find(q, KidProfile.class);
		List<String> kids = new ArrayList<String>();
		for (KidProfile profile : profiles) kids.add(profile.getKidId());
		
		q = schoolQuery(appId, schoolId);
		q.addCriteria(new Criteria("kidId").in(kids));
		q.addCriteria(new Criteria("date").is(timestampToDate(date)));
		return template.find(q, KidCalNote.class);
	}

	/**
	 * @param note
	 */
	public KidCalNote saveNote(KidCalNote note) {
		KidCalNote result = null;
		Query q = kidQuery(note.getAppId(),note.getSchoolId(),note.getKidId());
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
	 * @return
	 */
	public List<Communication> getCommunications(String appId, String schoolId) {
		Query query = schoolQuery(appId, schoolId);
		query.addCriteria(new Criteria("expireDate").gte(System.currentTimeMillis()));
		query.with(new Sort(Sort.Direction.ASC, "creationDate"));
		return template.find(query, Communication.class);
	}
	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @return
	 */
	public List<Communication> getKidCommunications(String appId, String schoolId, String kidId) {
		//TODO test this code
		Query query = schoolQuery(appId, schoolId);
		query.addCriteria(new Criteria("expireDate").gte(System.currentTimeMillis()));
		query.addCriteria(new Criteria("recipientsChild").is(kidId));
		query.with(new Sort(Sort.Direction.ASC, "creationDate"));
		return template.find(query, Communication.class);
	}

	/**
	 * @param comm
	 * @return
	 */
		public Communication saveCommunication(Communication communication) {
			List<String> resultRecipients = Lists.newArrayList(communication.getRecipientsChild());
			//expand group into list of kids
			//TODO test this code
			for(String groupId : communication.getRecipientsGroup()) {
				Query query = schoolQuery(communication.getAppId(), communication.getSchoolId());
				query.addCriteria(new Criteria("groups").is(groupId)); 
				List<KidProfile> kids = template.find(query, KidProfile.class);
				for(KidProfile kidProfile : kids) {
					if(!resultRecipients.contains(kidProfile.getKidId())) {
						resultRecipients.add(kidProfile.getKidId());
					}
				}
			}
			communication.setCommunicationId(Utils.getUUID());
			communication.setCreationDate(System.currentTimeMillis());
			template.save(communication);
			return communication;
		}

	/**
	 * @param appId
	 * @param schoolId
	 * @param commId
	 */
	public void deleteCommunication(String appId, String schoolId, String commId) {
		Query q = schoolQuery(appId, schoolId);
		q.addCriteria(new Criteria("communicationId").is(commId));
		template.remove(q, Communication.class);
	}

	/**
	 * @param comm
	 * @return
	 */
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
	public List<InternalNote> getInternalNotes(String appId, String schoolId, String[] sectionIds, long date) {
		Query q = schoolQuery(appId, schoolId);
		if (sectionIds != null && sectionIds.length > 0) {
			q.addCriteria(new Criteria("section.sectionId").in((Object[])sectionIds));
			q.fields().include("kidId");
			List<KidProfile> profiles = template.find(q, KidProfile.class);
			Set<String> ids = new HashSet<String>();
			for (KidProfile kp : profiles) ids.add(kp.getKidId());
			
			q = schoolQuery(appId, schoolId);
			q.addCriteria(new Criteria("date").is(timestampToDate(date)));
			q.addCriteria(new Criteria().orOperator(
					new Criteria("sectionIds").in((Object[])sectionIds), 
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
		public BusData getBusData(String appId, String schoolId, long date) {
			ListMultimap<String, BusData.KidProfile> mm = ArrayListMultimap.create();
			
			Query queryConfig = schoolQuery(appId, schoolId);
			queryConfig.addCriteria(new Criteria("useBus").is(true));
			List<KidConfig> kidConfigList = template.find(queryConfig, KidConfig.class);
			
			Map<String, Person> personMap = getPersonMap(appId, schoolId);
			Map<String, KidProfile> kidProfileMap = getKidProfileMap(appId, schoolId);
			
			Map<String, KidCalAssenza> assenzeMap = readAssenze(appId, schoolId, date);
			Map<String, KidCalRitiro> ritiriMap = readRitiri(appId, schoolId, date);
	
			for (KidConfig conf : kidConfigList) {
				BusData.KidProfile busKidProfile = new BusData.KidProfile();
				KidProfile kp = kidProfileMap.get(conf.getKidId());
				
				busKidProfile.setFullName(kp.getFullName());
				busKidProfile.setImage(kp.getImage());
				busKidProfile.setKidId(kp.getKidId());
	
				//if assenza continue
				KidCalAssenza assenza = assenzeMap.get(kp.getKidId());
				//check assenza
				if (assenza != null) {
					continue;
				} else {
					//check ritiro
					KidCalRitiro ritiro = ritiriMap.get(kp.getKidId());
					if(ritiro != null) {
						if(!ritiro.isUsingBus()) {
							continue;
						}
						Person person = personMap.get(ritiro.getPersonId());
						if(person != null) {
							busKidProfile.setVariation(true);
							busKidProfile.setPersonWhoWaitId(person.getPersonId());
							busKidProfile.setPersonWhoWaitName(person.getFullName());
							busKidProfile.setPersonWhoWaitRelation(Utils.getPersonRelation(person));
							busKidProfile.setBusStop(ritiro.getBusStop());
							mm.put(conf.getBusId(), busKidProfile);
						}
					} else {
						//default conf
						Person person = personMap.get(conf.getDefaultPerson());
						if(person != null) {
							busKidProfile.setVariation(true);
							busKidProfile.setPersonWhoWaitId(person.getPersonId());
							busKidProfile.setPersonWhoWaitName(person.getFullName());
							busKidProfile.setPersonWhoWaitRelation(Utils.getPersonRelation(person));
							busKidProfile.setBusStop(conf.getBusStop());
							mm.put(conf.getBusId(), busKidProfile);
						}
					}
				}
			}
			
			BusData data = new BusData();
			data.setAppId(appId);
			data.setSchoolId(schoolId);
			data.setDate(timestampToDate(date));
			data.setBuses(new ArrayList<BusData.Bus>());
			
			Query queryBus = schoolQuery(appId, schoolId);
			List<Bus> busList = template.find(queryBus, Bus.class);
			for (Bus bus : busList) {
				BusData.Bus b = new BusData.Bus();
				b.setBusId(bus.getBusId());
				b.setBusName(bus.getName());
				b.setChildren(mm.get(bus.getBusId()));
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
	public List<SectionData> getSections(String appId, String schoolId, Collection<String> sections, long date) {
		SchoolProfile profile = getSchoolProfile(appId, schoolId);
		Map<String, SectionData> map = new HashMap<String, SectionData>();
//		for (SectionProfile p : profile.getSections()) {
//			if (!sections.contains(p.getSectionId())) continue;
//			
//			SectionData sd = new SectionData();
//			sd.setSectionId(p.getSectionId());
//			sd.setSectionName(p.getName());
//			sd.setAppId(appId);
//			sd.setSchoolId(schoolId);
//			sd.setChildren(new ArrayList<SectionData.KidProfile>());
//			map.put(p.getSectionId(), sd);
//		}
		
		List<KidProfile> kids = readKidsForSections(appId, schoolId, sections);
		Map<String, KidCalAssenza> assenzeMap = readAssenze(appId, schoolId, date);
		Map<String, KidCalRitiro> ritiriMap = readRitiri(appId, schoolId, date);
//		Map<String, KidCalFermata> stopsMap = readFermate(appId, schoolId, date);
		Map<String, KidConfig> configMap = readConfigurations(appId, schoolId);
		
		for (KidProfile kp : kids) {
			KidConfig conf = configMap.get(kp.getKidId());

			SectionData.KidProfile skp = new SectionData.KidProfile();
			skp.setKidId(kp.getKidId());
			skp.setChildrenName(kp.getFullName());
			skp.setImage(kp.getImage());
			skp.setActive(kp.isActive());

			// merge service state from config and from profile
			skp.setAnticipo(new ServiceProfile(kp.getServices().getAnticipo().isEnabled(), conf != null ? conf.anticipoActive() : true));
			skp.setPosticipo(new ServiceProfile(kp.getServices().getPosticipo().isEnabled(), conf != null ? conf.posticipoActive() : true));
			skp.setMensa(new ServiceProfile(kp.getServices().getMensa().isEnabled(), conf != null ? conf.mensaActive() : true));
			skp.setBus(new ServiceProfile(kp.getServices().getBus().isEnabled(), conf != null ? conf.busActive() : true));

			// if absent, set exit time to null
			if (assenzeMap.containsKey(kp.getKidId())) {
				KidCalAssenza a = assenzeMap.get(kp.getKidId());
				skp.setExitTime(null);
//				skp.setNote(a.getNote());
				if(a.getReason() != null) {
//					skp.setAbsenceType(a.getReason().getType());
				}
			} else if (ritiriMap.containsKey(kp.getKidId())){
				KidCalRitiro r = ritiriMap.get(kp.getKidId());
				skp.setExitTime(r.getDate());
			} else {
				skp.setExitTime(computeTime(date, conf,kp, profile));
			}
			
			// read from ritiro object
			String personId = null;
			if (ritiriMap.containsKey(kp.getKidId())) {
				KidCalRitiro r = ritiriMap.get(kp.getKidId());
//				skp.setPersonException(r.isExceptional());
//				skp.setNote(r.getNote());
				personId = r.getPersonId();
			}
			// if no explicit return, read stop from stop object, otherwise from config, otherwise from profile
			else if (skp.getBus().isActive()) {
//				if (stopsMap.containsKey(kp.getKidId())) {
//					KidCalFermata fermata = stopsMap.get(kp.getKidId());
//					skp.setNote(fermata.getNote());
//					skp.setStopId(fermata.getStopId());
//					skp.setStopException(true);
//					personId = fermata.getPersonId();
//				} else {
//					skp.setStopId(conf != null ? conf.getServices().getBus().getDefaultIdBack() : kp.getServices().getBus().getStops().get(0).getStopId());
//				}
			}
			
			if (personId == null) {
				personId = conf != null ? conf.getDefaultPerson() : findDefaultPerson(kp);
			}
			
			skp.setPersonId(personId);
			skp.setPersonName(getPerson(personId, conf, kp).getFullName());
			
			//set if extist some KidCalNote
			List<KidCalNote> list = getKidCalNotes(appId, schoolId, skp.getKidId(), date);
			if((list != null) && (list.size() > 0)) {
				skp.setCalNotes(true);
			} else {
				skp.setCalNotes(false);
			}
//			map.get(kp.getSection().getSectionId()).getChildren().add(skp);
		}
		
		return new ArrayList<SectionData>(map.values());
	}

	private Map<String, KidConfig> readConfigurations(String appId,
			String schoolId) {
		Query q = schoolQuery(appId, schoolId);
		List<KidConfig> configs = template.find(q, KidConfig.class);
		Map<String, KidConfig> configMap = new HashMap<String, KidConfig>();
		for (KidConfig c : configs) {
			configMap.put(c.getKidId(), c);
		}
		return configMap;
	}

//	private Map<String, KidCalFermata> readFermate(String appId,
//			String schoolId, long date) {
//		Query q = schoolQuery(appId, schoolId);
//		q.addCriteria(new Criteria("date").is(timestampToDate(date)));
//		List<KidCalFermata> stops = template.find(q, KidCalFermata.class);
//		Map<String, KidCalFermata> stopsMap = new HashMap<String, KidCalFermata>();
//		for (KidCalFermata s : stops) {
//			stopsMap.put(s.getKidId(), s);
//		}
//		return stopsMap;
//	}

	private Map<String, KidCalRitiro> readRitiri(String appId, String schoolId,
			long date) {
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
		addDayCriteria(date, q);
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

	/**
	 * @param kp
	 * @return
	 */
	private String findDefaultPerson(KidProfile kp) {
		return kp.getAuthorizedPersons().get(0);
	}

	/**
	 * @param personId
	 * @param conf
	 * @param kp
	 * @return 
	 */
	private AuthPerson getPerson(String personId, KidConfig conf, KidProfile kp) {
//		for (AuthPerson ap: kp.getPersons()) {
//			if (ap.getPersonId().equals(personId)) return ap;
//		}
		if (conf != null && conf.getExtraPersons() != null) {
			for (AuthPerson ap : conf.getExtraPersons()) {
				if (ap.getPersonId().equals(personId)) return ap;
			}
		}
		personId = conf != null ? conf.getDefaultPerson() : findDefaultPerson(kp);
//		for (AuthPerson ap: kp.getPersons()) {
//			if (ap.getPersonId().equals(personId)) return ap;
//		}

		return null;
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @return
	 */
	public List<TeacherCalendar> getTeacherCalendar(String appId, String schoolId, long from, long to) {
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
		
		String exit = 
				  kp.getServices().getPosticipo().isEnabled() 
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
	public Parent getParent(String username, String appId, String schoolId) {
		Query q = appQuery(appId);
		q.addCriteria(new Criteria("username").is(username));
		Parent p = template.findOne(q, Parent.class);
		return p;
	}
	
	public List<DiaryEntry> getDiary(String appId, String schoolId, String kidId, String search, Integer skip, Integer pageSize, Long from, Long to, String tag) {
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
	
	public DiaryEntry getDiaryEntry(String appId, String schoolId, String kidId, String entryId) {
		Query q = kidQuery(appId, schoolId, kidId);
		q.addCriteria(new Criteria("entryId").is(entryId));
		return template.findOne(q, DiaryEntry.class);
	}

	public void deleteDiaryEntry(String appId, String schoolId, String kidId, String entryId) {
		// TODO cleanup multimedia 
		Query q = kidQuery(appId, schoolId, kidId);
		q.addCriteria(new Criteria("entryId").is(entryId));
		template.remove(q, DiaryEntry.class);
	}

	
	public void saveDiaryEntry(DiaryEntry diary) {
		Query q = kidQuery(diary.getAppId(), diary.getSchoolId(), diary.getKidId());
		q.addCriteria(new Criteria("entryId").is(diary.getEntryId()));
		template.remove(q, DiaryEntry.class);
		template.save(diary);
	}
	
	public MultimediaEntry getMultimediaEntry(String appId, String schoolId, String kidId, String multimediaId) {
		Query q = kidQuery(appId, schoolId, kidId);
		q.addCriteria(new Criteria("multimediaId").is(multimediaId));
		return template.findOne(q, MultimediaEntry.class);
	}	

	public void saveMultimediaEntry(MultimediaEntry multimediaEntry) {
		Query q = kidQuery(multimediaEntry.getAppId(), multimediaEntry.getSchoolId(), multimediaEntry.getKidId());
		q.addCriteria(new Criteria("multimediaId").is(multimediaEntry.getMultimediaId()));
		template.remove(q, MultimediaEntry.class);
		template.save(multimediaEntry);
	}	
	
	public void sortNotes(List<Note> notes) {
		if((notes != null) && (notes.size() > 0)) {
			//order notes inside
			Comparator<Note> comparator = new Comparator<Note>() {
				@Override
				public int compare(Note o1, Note o2) {
					Long date1 = new Long(o1.getDate());
					Long date2 = new Long(o2.getDate());
					return date2.compareTo(date1);
				}
			};
			Collections.sort(notes,	comparator);
		}
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @return
	 */
	public DiaryKid getDiaryKid(String appId, String schoolId, String kidId) {
		DiaryKid kid = template.findOne(kidQuery(appId, schoolId, kidId), DiaryKid.class);
		return kid;
	}

	/**
	 * @param kid
	 * @param isTeacher
	 * @return
	 */
	public DiaryKid updateDiaryKid(DiaryKid kid, boolean isTeacher) {
		DiaryKid old = template.findOne(kidQuery(kid.getAppId(), kid.getSchoolId(), kid.getKidId()), DiaryKid.class);
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
	public List<MultimediaEntry> getMultimediaEntries(String appId,
			String schoolId, String kidId, Integer skip, Integer pageSize,
			Long from, Long to) {

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
	public void cleanImages(String appId, String schoolId, String kidId, String entryId, Set<String> oldPics) {
		if (oldPics == null || oldPics.isEmpty()) return;
		
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

	public List<ChatMessage> getChatMessages(String appId, String schoolId, String kidId, long timestamp, int limit) {
		List<ChatMessage> result = null;
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("kidId").is(kidId);
		if(timestamp > 0) {
			criteria = criteria.and("creationDate").lte(timestamp);
		}
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.DESC, "creationDate"));
		query.limit(limit);
		result = template.find(query, ChatMessage.class);
		return result;
	}

	public ChatMessage saveChatMessage(ChatMessage message) {
		message.setMessageId(Utils.getUUID());
		template.save(message);
		return message;
	}

	public ChatMessage removeChatMessage(String appId, String schoolId, String messageId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId)
				.and("messageId").is(messageId);
		Query query = new Query(criteria);
		ChatMessage dbMessage = template.findOne(query, ChatMessage.class);
		if(dbMessage != null) {
			template.remove(query, ChatMessage.class);
		}
		return dbMessage;
	}

	public ChatMessage updateChatMessage(ChatMessage message) {
		Criteria criteria = new Criteria("appId").is(message.getAppId()).and("schoolId").is(message.getSchoolId())
				.and("messageId").is(message.getMessageId());
		Query query = new Query(criteria);
		ChatMessage dbMessage = template.findOne(query, ChatMessage.class);
		if(dbMessage != null) {
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
	
	public ChatMessage chatMessageReceived(String appId, String schoolId, String messageId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId)
				.and("messageId").is(messageId);
		Query query = new Query(criteria);
		ChatMessage dbMessage = template.findOne(query, ChatMessage.class);
		if(dbMessage != null) {
			Update update = new Update();
			update.set("received", Boolean.TRUE);
			template.updateFirst(query, update, ChatMessage.class);
			dbMessage.setReceived(Boolean.TRUE);
		}
		return dbMessage;
	}

	public ChatMessage chatMessageSeen(String appId, String schoolId, String messageId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId)
				.and("messageId").is(messageId);
		Query query = new Query(criteria);
		ChatMessage dbMessage = template.findOne(query, ChatMessage.class);
		if(dbMessage != null) {
			Update update = new Update();
			update.set("seen", Boolean.TRUE);
			template.updateFirst(query, update, ChatMessage.class);
			dbMessage.setSeen(Boolean.TRUE);
		}
		return dbMessage;
	}

	public List<SchoolProfile> getSchoolProfileByAppId(String appId) {
		Criteria criteria = new Criteria("appId").is(appId);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "name"));
		List<SchoolProfile> result = template.find(query, SchoolProfile.class);
		return result;
	}

	public List<KidProfile> getKidProfileBySchoolId(String appId, String schoolId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "fullName"));
		List<KidProfile> result = template.find(query, KidProfile.class);
		return result;
	}

	public List<Bus> getBusDataBySchoolId(String appId, String schoolId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "name"));
		List<Bus> result = template.find(query, Bus.class);
		return result;
	}

	public List<Group> getGroupDataBySchoolId(String appId, String schoolId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "name"));
		List<Group> result = template.find(query, Group.class);
		return result;
	}

	public List<Person> getPersonDataBySchoolId(String appId, String schoolId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "fullName"));
		List<Person> result = template.find(query, Person.class);
		return result;
	}

	public List<Teacher> getTeacherDataBySchoolId(String appId, String schoolId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId);
		Query query = new Query(criteria);
		query.with(new Sort(Sort.Direction.ASC, "fullName"));
		List<Teacher> result = template.find(query, Teacher.class);
		return result;
	}
	
	public SchoolProfile removeSchoolProfile(String appId, String schoolId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId);
		Query query = new Query(criteria);
		SchoolProfile dbEntry = template.findOne(query, SchoolProfile.class);
		if(dbEntry != null) {
			template.remove(query, SchoolProfile.class);
		}
		return dbEntry;
	}

	public KidProfile removeKidProfile(String appId, String schoolId, String kidId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("kidId").is(kidId);
		Query query = new Query(criteria);
		KidProfile dbEntry = template.findOne(query, KidProfile.class);
		if(dbEntry != null) {
			template.remove(query, KidProfile.class);
		}
		return dbEntry;
	}

	public Group removeGroup(String appId, String schoolId, String groupId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("groupId").is(groupId);
		Query query = new Query(criteria);
		Group dbEntry = template.findOne(query, Group.class);
		if(dbEntry != null) {
			template.remove(query, Group.class);
		}
		return dbEntry;
	}

	public Bus removeBus(String appId, String schoolId, String busId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("busId").is(busId);
		Query query = new Query(criteria);
		Bus dbEntry = template.findOne(query, Bus.class);
		if(dbEntry != null) {
			template.remove(query, Bus.class);
		}
		return dbEntry;
	}

	public Person removePerson(String appId, String schoolId, String personId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("personId").is(personId);
		Query query = new Query(criteria);
		Person dbEntry = template.findOne(query, Person.class);
		if(dbEntry != null) {
			template.remove(query, Person.class);
		}
		return dbEntry;
	}

	public Teacher removeTeacher(String appId, String schoolId, String teacherId) {
		Criteria criteria = new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("teacherId").is(teacherId);
		Query query = new Query(criteria);
		Teacher dbEntry = template.findOne(query, Teacher.class);
		if(dbEntry != null) {
			template.remove(query, Teacher.class);
		}
		return dbEntry;
	}
	
	public SchoolProfile saveSchoolProfile(SchoolProfile profile) {
		Criteria criteria = new Criteria("appId").is(profile.getAppId()).and("schoolId").is(profile.getSchoolId());
		Query query = new Query(criteria);
		SchoolProfile dbEntry = template.findOne(query, SchoolProfile.class);
		if(dbEntry != null) {
			template.remove(query, SchoolProfile.class);
		}
		template.save(profile);
		return profile;
	}

	public KidProfile saveKidProfile(KidProfile profile) {
		Criteria criteria = new Criteria("appId").is(profile.getAppId()).and("schoolId").is(profile.getSchoolId())
				.and("kidId").is(profile.getKidId());
		Query query = new Query(criteria);
		KidProfile dbEntry = template.findOne(query, KidProfile.class);
		if(dbEntry != null) {
			template.remove(query, KidProfile.class);
		}
		template.save(profile);
		return profile;
	}

	public Group saveGroup(Group profile) {
		Criteria criteria = new Criteria("appId").is(profile.getAppId()).and("schoolId").is(profile.getSchoolId())
				.and("groupId").is(profile.getGroupId());
		Query query = new Query(criteria);
		Group dbEntry = template.findOne(query, Group.class);
		if(dbEntry != null) {
			template.remove(query, Group.class);
		}
		template.save(profile);
		return profile;
	}

	public Bus saveBus(Bus profile) {
		Criteria criteria = new Criteria("appId").is(profile.getAppId()).and("schoolId").is(profile.getSchoolId())
				.and("busId").is(profile.getBusId());
		Query query = new Query(criteria);
		Bus dbEntry = template.findOne(query, Bus.class);
		if(dbEntry != null) {
			template.remove(query, Bus.class);
		}
		template.save(profile);
		return profile;
	}

	public Person savePerson(Person profile) {
		Criteria criteria = new Criteria("appId").is(profile.getAppId()).and("schoolId").is(profile.getSchoolId())
				.and("busId").is(profile.getPersonId());
		Query query = new Query(criteria);
		Person dbEntry = template.findOne(query, Person.class);
		if(dbEntry != null) {
			template.remove(query, Person.class);
		}
		template.save(profile);
		return profile;
	}

	public Teacher saveTeacher(Teacher profile) {
		Criteria criteria = new Criteria("appId").is(profile.getAppId()).and("schoolId").is(profile.getSchoolId())
				.and("busId").is(profile.getTeacherId());
		Query query = new Query(criteria);
		Teacher dbEntry = template.findOne(query, Teacher.class);
		if(dbEntry != null) {
			template.remove(query, Teacher.class);
		}
		template.save(profile);
		return profile;
	}
	
	public String getSectionId(KidProfile profile) {
		Criteria criteria = new Criteria("appId").is(profile.getAppId()).and("schoolId").is(profile.getSchoolId());
		Query query = new Query(criteria);
		List<Group> groups = template.find(query, Group.class);
		for(Group group : groups) {
			if(group.isSection() && (profile.getGroups().contains(group.getGroupId()))) {
				return group.getGroupId(); 
			}
		}
		return null;
	}
	
	public Map<String, Person> getPersonMap(String appId, String schoolId) {
		Map<String, Person> result = new HashMap<String, Person>();
		Query query = schoolQuery(appId, schoolId);
		List<Person> persons = template.find(query, Person.class);
		for(Person person : persons) {
			result.put(person.getPersonId(), person);
		}
		return result;
	}
	
	public Map<String, KidProfile> getKidProfileMap(String appId, String schoolId) {
		Map<String, KidProfile> result = new HashMap<String, KidProfile>();
		Query query = schoolQuery(appId, schoolId);
		List<KidProfile> profiles = template.find(query, KidProfile.class);
		for(KidProfile profile : profiles) {
			result.put(profile.getKidId(), profile);
		}
		return result;
	}

}
