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

package it.smartcommunitylab.ungiorno.controller;

import it.smartcommunitylab.ungiorno.model.BusData;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.InternalNote;
import it.smartcommunitylab.ungiorno.model.Menu;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TeacherCalendar;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;

import java.util.Collection;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SchoolController {

	@Autowired
	private RepositoryManager storage;

	@RequestMapping(method = RequestMethod.GET, value = "/ping")
	public @ResponseBody
	String ping(HttpServletRequest request, HttpServletResponse response, HttpSession session) {
		return "PONG";
	}


	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/profile")
	public @ResponseBody Response<SchoolProfile> getSchoolProfile(@PathVariable String appId, @PathVariable String schoolId) {
		try {
			SchoolProfile profile = storage.getSchoolProfile(appId, schoolId);
			return new Response<SchoolProfile>(profile);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/profile")
	public @ResponseBody Response<SchoolProfile> getSchoolProfileForTeacher(@PathVariable String appId) {
		try {
			String userId = getUserId();
			SchoolProfile profile = storage.getSchoolProfileForUser(appId, userId);
			return new Response<SchoolProfile>(profile);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.POST, value = "/school/{appId}/{schoolId}/communications")
	public @ResponseBody Response<Communication> sendCommunication(@RequestBody Communication comm, @PathVariable String appId, @PathVariable String schoolId) {

		try {
			comm.setAppId(appId);
			comm.setSchoolId(schoolId);
			return new Response<>(storage.saveCommunication(comm));
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}
	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/communications")
	public @ResponseBody Response<List<Communication>> getComms(@PathVariable String appId, @PathVariable String schoolId) {

		try {
			List<Communication> list = storage.getCommunications(appId, schoolId);
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.POST, value = "/school/{appId}/{schoolId}/notes")
	public @ResponseBody Response<InternalNote> sendNote(@RequestBody InternalNote comm, @PathVariable String appId, @PathVariable String schoolId, @RequestParam(required=false) String[] kidIds, @RequestParam(required=false) String[] sectionIds) {

		try {
			comm.setAppId(appId);
			comm.setSchoolId(schoolId);
			if (kidIds != null && kidIds.length > 0) {
				comm.setKidIds(kidIds);
			}
			else if (sectionIds != null && sectionIds.length > 0) {
				comm.setSectionIds(sectionIds);
			} else {
				comm.setSectionIds(storage.getTeacher(getUserId(), appId, schoolId).getSectionIds().toArray(new String[0]));
			}

			return new Response<>(storage.saveInternalNote(comm));
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/notes")
	public @ResponseBody Response<List<InternalNote>> getNotes(@PathVariable String appId, @PathVariable String schoolId, @RequestParam(required=false) String[] sectionIds, @RequestParam long date) {

		try {
			if (sectionIds == null || sectionIds.length == 0) {
				sectionIds = (String[])storage.getTeacher(getUserId(), appId, schoolId).getSectionIds().toArray(new String[0]);
			}
			List<InternalNote> list = storage.getInternalNotes(appId, schoolId, sectionIds, date);
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.DELETE, value = "/school/{appId}/{schoolId}/communications/{commId}")
	public @ResponseBody Response<Void> deleteCommunication(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String commId) {

		try {
			storage.deleteCommunication(appId, schoolId, commId);
			return new Response<>((Void)null);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}


	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/menu")
	public @ResponseBody Response<List<Menu>> getMeals(@PathVariable String appId, @PathVariable String schoolId, @RequestParam long from, @RequestParam long to) {

		try {
			List<Menu> list = storage.getMeals(appId, schoolId, from, to);
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/teachers")
	public @ResponseBody Response<List<Teacher>> getTeachers(@PathVariable String appId, @PathVariable String schoolId) {

		try {
			List<Teacher> list = storage.getTeachers(appId, schoolId);
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}
	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/teachercalendar")
	public @ResponseBody Response<List<TeacherCalendar>> getTeacherCalendar(@PathVariable String appId, @PathVariable String schoolId, @RequestParam long from, @RequestParam long to) {

		try {
			List<TeacherCalendar> list = storage.getTeacherCalendar(appId, schoolId, from, to);
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/buses")
	public @ResponseBody Response<BusData> getBuses(@PathVariable String appId, @PathVariable String schoolId, @RequestParam long date) {

		try {
			BusData buses = storage.getBusData(appId, schoolId, date);
			return new Response<>(buses);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/sections")
	public @ResponseBody Response<List<SectionData>> getSections(@PathVariable String appId, @PathVariable String schoolId, @RequestParam long date) {

		try {

			Collection<String> sections = storage.getTeacher(getUserId(), appId, schoolId).getSectionIds();
			List<SectionData> list = storage.getSections(appId, schoolId, sections , date);
			return new Response<>(list);
		} catch (Exception e) {
			e.printStackTrace();
			return new Response<>(e.getMessage());
		}
	}

	/**
	 * @return
	 */
	private String getUserId() {
		// TODO Auto-generated method stub
		return "giulia.puccini@gmail.com";
	}

}
