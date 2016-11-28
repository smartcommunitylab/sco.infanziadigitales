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
package it.smartcommunitylab.ungiorno.model;

import it.smartcommunitylab.ungiorno.diary.model.DiaryKid.DiaryKidPerson;

import java.util.List;

/**
 * @author raman
 *
 */
public class Teacher extends SchoolObject {
	private String teacherId, username, teacherFullname, teacherSurname, teacherName, colorToDisplay, pin;
	private List<String> sectionIds;

	public String getTeacherId() {
		return teacherId;
	}

	public void setTeacherId(String teacherId) {
		this.teacherId = teacherId;
	}

	public List<String> getSectionIds() {
		return sectionIds;
	}

	public void setSectionIds(List<String> sectionIds) {
		this.sectionIds = sectionIds;
	}

	public String getTeacherFullname() {
		return teacherFullname;
	}

	public void setTeacherFullname(String teacherFullname) {
		this.teacherFullname = teacherFullname;
	}

	public String getTeacherSurname() {
		return teacherSurname;
	}

	public void setTeacherSurname(String teacherSurname) {
		this.teacherSurname = teacherSurname;
	}

	public String getTeacherName() {
		return teacherName;
	}

	public void setTeacherName(String teacherName) {
		this.teacherName = teacherName;
	}

	public String getColorToDisplay() {
		return colorToDisplay;
	}

	public void setColorToDisplay(String colorToDisplay) {
		this.colorToDisplay = colorToDisplay;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPin() {
		return pin;
	}

	public void setPin(String pin) {
		this.pin = pin;
	}

	/**
	 * @param b
	 * @return
	 */
	public DiaryKidPerson toDiaryKidPerson(boolean authorized) {
		DiaryKidPerson p = new DiaryKidPerson();
		p.setAdult(true);
		p.setTeacher(true);
		p.setAuthorized(authorized);
		p.setFirstName(teacherName);
		p.setFullName(teacherFullname);
		p.setLastName(teacherSurname);
		p.setParent(false);
		p.setPersonId(teacherId);
		return p;
	}
}
