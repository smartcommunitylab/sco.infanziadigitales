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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
		@Override
		public int hashCode() {
			final int prime = 31;
			int result = 1;
			result = prime * result + ((note == null) ? 0 : note.hashCode());
			result = prime * result
					+ ((personId == null) ? 0 : personId.hashCode());
			result = prime * result + ((type == null) ? 0 : type.hashCode());
			return result;
		}
		@Override
		public boolean equals(Object obj) {
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			Note other = (Note) obj;
			if (note == null) {
				if (other.note != null)
					return false;
			} else if (!note.equals(other.note))
				return false;
			if (personId == null) {
				if (other.personId != null)
					return false;
			} else if (!personId.equals(other.personId))
				return false;
			if (type == null) {
				if (other.type != null)
					return false;
			} else if (!type.equals(other.type))
				return false;
			return true;
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
		if (parentNotes == null) parentNotes = new ArrayList<KidCalNote.Note>();
		return parentNotes;
	}
	public void setParentNotes(List<Note> parentNotes) {
		this.parentNotes = parentNotes;
	}
	public List<Note> getSchoolNotes() {
		if (schoolNotes == null) schoolNotes = new ArrayList<KidCalNote.Note>();
		return schoolNotes;
	}
	public void setSchoolNotes(List<Note> schoolNotes) {
		this.schoolNotes = schoolNotes;
	}

	public void merge(KidCalNote note) {
		Set<Note> notes = new HashSet<KidCalNote.Note>(getParentNotes());
		notes.addAll(note.getParentNotes());
		parentNotes.clear();
		parentNotes.addAll(notes);
		
		notes = new HashSet<KidCalNote.Note>(getSchoolNotes());
		notes.addAll(note.getSchoolNotes());
		schoolNotes.clear();
		schoolNotes.addAll(notes);
	}
}
