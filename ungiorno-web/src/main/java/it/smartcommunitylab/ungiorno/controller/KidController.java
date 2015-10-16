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

import it.smartcommunitylab.ungiorno.model.CalendarItem;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidCalAssenza;
import it.smartcommunitylab.ungiorno.model.KidCalFermata;
import it.smartcommunitylab.ungiorno.model.KidCalNote;
import it.smartcommunitylab.ungiorno.model.KidCalNote.Note;
import it.smartcommunitylab.ungiorno.model.KidCalRitiro;
import it.smartcommunitylab.ungiorno.model.KidConfig;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.google.common.collect.Sets.SetView;

@RestController
public class KidController {

	@Autowired
	private RepositoryManager storage;
	
	@Autowired
	private PermissionsManager permissions;	

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/calendar")
	public @ResponseBody Response<List<CalendarItem>> getCalendar(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long from, @RequestParam long to) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}

			List<CalendarItem> list = storage.getCalendar(appId, schoolId, kidId, from, to);
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}

	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/profiles")
	public @ResponseBody Response<List<KidProfile>> getProfiles(@PathVariable String appId) {

		try {
			String userId = permissions.getUserId();

			List<KidProfile> profiles = storage.getKidProfilesByParent(appId, userId);
			return new Response<>(profiles);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}

	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/profile")
	public @ResponseBody Response<KidProfile> getProfile(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}

			KidProfile profile = storage.getKidProfile(appId, schoolId, kidId);
			return new Response<>(profile);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}

	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/config")
	public @ResponseBody Response<KidConfig> getConfig(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}

			KidConfig profile = storage.getKidConfig(appId, schoolId, kidId);
			return new Response<>(profile);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/config")
	public @ResponseBody Response<KidConfig> sendConfig(@RequestBody KidConfig config, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}
			
			config.setAppId(appId);
			config.setKidId(kidId);
			config.setSchoolId(schoolId);

			config = storage.saveConfig(config);
			return new Response<>(config);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/stop")
	public @ResponseBody Response<KidConfig> sendStop(@RequestBody KidCalFermata stop, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}
			
			stop.setAppId(appId);
			stop.setKidId(kidId);
			stop.setSchoolId(schoolId);

			KidConfig config = storage.saveStop(stop);
			return new Response<>(config);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/stop")
	public @ResponseBody Response<KidCalFermata> getStop(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}
			
			KidCalFermata obj = storage.getStop(appId, schoolId, kidId, date);
			return new Response<>(obj);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/absence")
	public @ResponseBody Response<KidConfig> sendAssenza(@RequestBody KidCalAssenza absence, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
				return new Response<>();
			}
			
			absence.setAppId(appId);
			absence.setKidId(kidId);
			absence.setSchoolId(schoolId);

			KidConfig config = storage.saveAbsence(absence);
			return new Response<>(config);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/absence")
	public @ResponseBody Response<KidCalAssenza> getAssenza(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}			
			
			KidCalAssenza obj = storage.getAbsence(appId, schoolId, kidId, date);
			return new Response<>(obj);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}
	

	@RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/return")
	public @ResponseBody Response<KidConfig> sendRitiro(@RequestBody KidCalRitiro ritiro, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
				return new Response<>();
			}
			
			ritiro.setAppId(appId);
			ritiro.setKidId(kidId);
			ritiro.setSchoolId(schoolId);

			KidConfig config = storage.saveReturn(ritiro);
			return new Response<>(config);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/return")
	public @ResponseBody Response<KidCalRitiro> getRitiro(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}
			
			KidCalRitiro obj = storage.getReturn(appId, schoolId, kidId, date);
			return new Response<>(obj);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}


	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/notes")
	public @ResponseBody Response<List<KidCalNote>> getNotes(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}

			List<KidCalNote> list = storage.getKidCalNotes(appId, schoolId, kidId, date);
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}

	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/notes")
	public @ResponseBody Response<List<KidCalNote>> getSectionNotes(@PathVariable String appId, @PathVariable String schoolId, @RequestParam(required=false) String[] sectionIds, @RequestParam long date) {

		Set<String> sIds;
		if (sectionIds != null) {
			sIds = Sets.newHashSet(sectionIds);
		} else {
			sIds = Sets.newHashSet();
		}
		
		Teacher teacher = storage.getTeacher(permissions.getUserId(), appId, schoolId);

		if (teacher == null) {
			return new Response<>();
		}
		
		Set<String> tsIds = Sets.newHashSet(teacher.getSectionIds());
		
		SetView sv = Sets.intersection(sIds, tsIds);
		String[] sections = (String[])Lists.newArrayList(sv).toArray(new String[]{});
		
		try {
			List<KidCalNote> list = storage.getKidCalNotesForSection(appId, schoolId, sections, date);
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}

	}


	@RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/notes")
	public @ResponseBody Response<KidCalNote> saveNote(@RequestBody KidCalNote note, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

		try {
			note.setAppId(appId);
			note.setKidId(kidId);
			note.setSchoolId(schoolId);
			if (note.getParentNotes() != null && !note.getParentNotes().isEmpty()) {
				if (!permissions.checkKidProfile(appId, schoolId, kidId, true)) {
					return new Response<>();
				}				
				
				Parent parent = storage.getParent(permissions.getUserId(), appId, schoolId);
				if (parent == null) throw new IllegalArgumentException("No person registered");
				for (Note n : note.getParentNotes()) {
					n.setPersonId(parent.getPersonId());
				}
			} else if (note.getSchoolNotes() != null && !note.getSchoolNotes().isEmpty()) {
				if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
					return new Response<>();
				}				
				
				Teacher teacher = storage.getTeacher(permissions.getUserId(), appId, schoolId);
				if (teacher == null) throw new IllegalArgumentException("No teacher registered");
				for (Note n : note.getSchoolNotes()) {
					n.setPersonId(teacher.getTeacherId());
				}
			} else {
				throw new IllegalArgumentException("Incorrect note");
			}

			return new Response<>(storage.saveNote(note));
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}

	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/communications")
	public @ResponseBody Response<List<Communication>> getComms(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
				return new Response<>();
			}

			List<Communication> list = storage.getKidCommunications(appId, schoolId, kidId);
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

}
