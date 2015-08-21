/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
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
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.storage;

import it.smartcommunitylab.ungiorno.model.BusData;
import it.smartcommunitylab.ungiorno.model.CalendarItem;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidCalNote;
import it.smartcommunitylab.ungiorno.model.KidConfig;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Menu;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TeacherCalendar;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * @author raman
 *
 */
public class DumpDataHelper {
    private static ObjectMapper fullMapper = new ObjectMapper();
	private static <T> T readObject(String name, Class<T> cls) {
		try {
			return fullMapper.readValue(Thread.currentThread().getContextClassLoader().getResourceAsStream("dump/"+name), cls);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	private static <T> List<T> readList(String name, Class<T> cls) {
		try {
			List<Object> list = fullMapper.readValue(Thread.currentThread().getContextClassLoader().getResourceAsStream("dump/"+name), new TypeReference<List<?>>() { });
			List<T> result = new ArrayList<T>();
			for (Object o : list) {
				result.add(fullMapper.convertValue(o,cls));
			}
			return result;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}

	}




	public static List<CalendarItem> dummyCalendar(String appId, String schoolId, String kidId, long from, long to) {
		return readList("calendario-scuola.json", CalendarItem.class);
	}
	public static SchoolProfile dummySchoolProfile(String appId, String schoolId) {
		return readObject("scuola-profilo.json", SchoolProfile.class);
	}
	public static KidProfile dummyKidProfile(String appId, String schoolId, String kidId) {
		return readObject("bambino-profilo.json", KidProfile.class);
	}
	public static KidConfig dummyKidConfig(String appId, String schoolId, String kidId) {
		return readObject("bambino-configurazione.json", KidConfig.class);
	}
	public static List<KidCalNote> dummyKidNotes(String appId, String schoolId, String kidId) {
		return readList("calendario-note.json", KidCalNote.class);
	}
	public static List<Communication> dummyComms(String appId, String schoolId) {
		return readList("calendario-comunicazioni.json", Communication.class);
	}
	public static List<Menu> dummyMenu(String appId, String schoolId) {
		return readList("calendario-mensa.json", Menu.class);
	}
	public static List<Teacher> dummyTeachers(String appId, String schoolId) {
		return readList("teacher-profile.json", Teacher.class);
	}
	public static BusData dummyBusData(String appId, String schoolId) {
		return readObject("calendario-bus.json", BusData.class);
	}
	public static List<SectionData> dummySections(String appId, String schoolId) {
		return readList("sections-profile.json", SectionData.class);
	}
	public static List<TeacherCalendar> dummyTecherCalendar(String appId, String schoolId) {
		return readList("calendario-docenti.json", TeacherCalendar.class);
	}
}
