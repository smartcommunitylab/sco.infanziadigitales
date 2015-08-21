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

import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.BusData;
import it.smartcommunitylab.ungiorno.model.CalendarItem;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidCalAssenza;
import it.smartcommunitylab.ungiorno.model.KidCalFermata;
import it.smartcommunitylab.ungiorno.model.KidCalNote;
import it.smartcommunitylab.ungiorno.model.KidCalRitiro;
import it.smartcommunitylab.ungiorno.model.KidConfig;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Menu;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TeacherCalendar;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

@Component
public class RepositoryManager {

	@Autowired
	private AppSetup appSetup;

	@Autowired
	private MongoTemplate template;

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

	private Query appQuery(String appId) {
		return new Query(new Criteria("appId").is(appId));
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
		return DumpDataHelper.dummyCalendar(appId, schoolId, kidId, from, to);
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @return
	 */
	public SchoolProfile getSchoolProfile(String appId, String schoolId) {
		// TODO
		return DumpDataHelper.dummySchoolProfile(appId, schoolId);
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @return
	 */
	public KidProfile getKidProfile(String appId, String schoolId, String kidId) {
		// TODO
		return DumpDataHelper.dummyKidProfile(appId, schoolId, kidId);
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @return
	 */
	public KidConfig getKidConfig(String appId, String schoolId, String kidId) {
		// TODO
		return DumpDataHelper.dummyKidConfig(appId, schoolId, kidId);
	}

	/**
	 * @param config
	 * @return
	 */
	public KidConfig saveConfig(KidConfig config) {
		// TODO
		return config;
	}

	/**
	 * @param appId
	 * @param userId
	 * @return
	 */
	public List<KidProfile> getKidProfilesByParent(String appId, String userId) {
		// TODO
		return Collections.singletonList(DumpDataHelper.dummyKidProfile(appId, null, null));
	}

	/**
	 * @param stop
	 * @return
	 */
	public KidConfig saveStop(KidCalFermata stop) {
		// TODO
		return DumpDataHelper.dummyKidConfig(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
	}

	/**
	 * @param absence
	 * @return
	 */
	public KidConfig saveAbsence(KidCalAssenza absence) {
		// TODO
		return DumpDataHelper.dummyKidConfig(absence.getAppId(), absence.getSchoolId(), absence.getKidId());
	}

	/**
	 * @param ritiro
	 * @return
	 */
	public KidConfig saveReturn(KidCalRitiro ritiro) {
		// TODO
		return DumpDataHelper.dummyKidConfig(ritiro.getAppId(), ritiro.getSchoolId(), ritiro.getKidId());
	}

	/**
	 * @param appId
	 * @param userId
	 * @return
	 */
	public SchoolProfile getSchoolProfileForUser(String appId, String userId) {
		// TODO
		return getSchoolProfile(appId, null);
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @param date
	 * @return
	 */
	public List<KidCalNote> getKidCalNotes(String appId, String schoolId, String kidId, long date) {
		// TODO
		return DumpDataHelper.dummyKidNotes(appId, schoolId, kidId);
	}

	/**
	 * @param note
	 */
	public KidCalNote saveNote(KidCalNote note) {
		// TODO
		return note;
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @return
	 */
	public List<Communication> getCommunications(String appId, String schoolId) {
		// TODO
		return DumpDataHelper.dummyComms(appId, schoolId);
	}
	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @return
	 */
	public List<Communication> getKidCommunications(String appId, String schoolId, String kidId) {
		// TODO
		return DumpDataHelper.dummyComms(appId, schoolId);
	}

	/**
	 * @param comm
	 * @return
	 */
	public Communication saveCommunication(Communication comm) {
		// TODO
		return comm;
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param commId
	 */
	public void deleteCommunication(String appId, String schoolId, String commId) {
		// TODO

	}

	/**
	 * @param comm
	 * @return
	 */
	public KidCalNote saveInternalNote(KidCalNote comm) {
		// TODO
		return comm;
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param kidId
	 * @return
	 */
	public List<KidCalNote> getInternalNotes(String appId, String schoolId, String sectionId, long date) {
		// TODO
		return DumpDataHelper.dummyKidNotes(appId, schoolId, sectionId);
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
	 * @return
	 */
	public List<Teacher> getTeachers(String appId, String schoolId) {
		// TODO
		return DumpDataHelper.dummyTeachers(appId, schoolId);
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param date
	 * @return
	 */
	public BusData getBusData(String appId, String schoolId, long date) {
		// TODO
		return DumpDataHelper.dummyBusData(appId, schoolId);
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param date
	 * @return
	 */
	public List<SectionData> getSections(String appId, String schoolId, long date) {
		// TODO
		return DumpDataHelper.dummySections(appId, schoolId);
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


}
