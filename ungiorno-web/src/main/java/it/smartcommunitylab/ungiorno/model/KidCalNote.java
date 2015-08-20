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

import java.util.List;

/**
 * @author raman
 *
 */
public class KidCalNote extends SchoolObject {

	public static class Note {
		private String note, personId, type;

		public String getNote() {
			return note;
		}
		public void setNote(String note) {
			this.note = note;
		}
		public String getPersonId() {
			return personId;
		}
		public void setPersonId(String personId) {
			this.personId = personId;
		}
		public String getType() {
			return type;
		}
		public void setType(String type) {
			this.type = type;
		}
	}

	private String kidId;
	private long date;
	private List<Note> parentNotes, schoolNotes;

	public String getKidId() {
		return kidId;
	}
	public void setKidId(String kidId) {
		this.kidId = kidId;
	}
	public long getDate() {
		return date;
	}
	public void setDate(long date) {
		this.date = date;
	}
	public List<Note> getParentNotes() {
		return parentNotes;
	}
	public void setParentNotes(List<Note> parentNotes) {
		this.parentNotes = parentNotes;
	}
	public List<Note> getSchoolNotes() {
		return schoolNotes;
	}
	public void setSchoolNotes(List<Note> schoolNotes) {
		this.schoolNotes = schoolNotes;
	}

}
