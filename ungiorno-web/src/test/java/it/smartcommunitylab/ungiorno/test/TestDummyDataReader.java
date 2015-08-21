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
package it.smartcommunitylab.ungiorno.test;

import static org.junit.Assert.assertNotNull;
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
import it.smartcommunitylab.ungiorno.storage.DumpDataHelper;

import java.util.List;

import org.junit.Test;

/**
 * @author raman
 *
 */
public class TestDummyDataReader {

	/**
	 * 
	 */
	@Test
	public void testSchoolCalendar() {
		List<CalendarItem> obj = DumpDataHelper.dummyCalendar("", "", "", 0, 0);
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testSchoolProfile() {
		SchoolProfile obj = DumpDataHelper.dummySchoolProfile("", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testKidProfile() {
		KidProfile obj = DumpDataHelper.dummyKidProfile("", "", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testKidConfig() {
		KidConfig obj = DumpDataHelper.dummyKidConfig("", "", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testKidNotes() {
		List<KidCalNote> obj = DumpDataHelper.dummyKidNotes("", "", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testKidComms() {
		List<Communication> obj = DumpDataHelper.dummyComms("", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testMenu() {
		List<Menu> obj = DumpDataHelper.dummyMenu("", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testTeachers() {
		List<Teacher> obj = DumpDataHelper.dummyTeachers("", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testBusData() {
		BusData obj = DumpDataHelper.dummyBusData("", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testSections() {
		List<SectionData> obj = DumpDataHelper.dummySections("", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
	@Test
	public void testTeacherCalendar() {
		List<TeacherCalendar> obj = DumpDataHelper.dummyTecherCalendar("", "");
		System.err.println(obj.toString());
		assertNotNull(obj);
	}
}
