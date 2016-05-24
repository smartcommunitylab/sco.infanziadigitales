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
package it.smartcommunitylab.ungiorno.diary.model;

import it.smartcommunitylab.ungiorno.model.SchoolObject;

import java.util.ArrayList;
import java.util.List;

/**
 * @author raman
 *
 */
public class DiaryKid extends SchoolObject {
	
	private String _id;
	
	private String kidId, gender, fullName, firstName, lastName, image, personalNotes;
	private List<DiaryKidPerson> persons;
	private Long birthday;
	
	public String get_id() {
		return _id;
	}


	public void set_id(String _id) {
		this._id = _id;
	}


	public String getKidId() {
		return kidId;
	}


	public void setKidId(String kidId) {
		this.kidId = kidId;
	}


	public String getGender() {
		return gender;
	}


	public void setGender(String gender) {
		this.gender = gender;
	}


	public String getFullName() {
		return fullName;
	}


	public void setFullName(String fullName) {
		this.fullName = fullName;
	}


	public String getFirstName() {
		return firstName;
	}


	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}


	public String getLastName() {
		return lastName;
	}


	public void setLastName(String lastName) {
		this.lastName = lastName;
	}


	public String getImage() {
		return image;
	}


	public void setImage(String image) {
		this.image = image;
	}


	public String getPersonalNotes() {
		return personalNotes;
	}


	public void setPersonalNotes(String personalNotes) {
		this.personalNotes = personalNotes;
	}


	public List<DiaryKidPerson> getPersons() {
		if (persons == null) persons = new ArrayList<DiaryKid.DiaryKidPerson>();
		return persons;
	}


	public void setPersons(List<DiaryKidPerson> persons) {
		this.persons = persons;
	}

	public Long getBirthday() {
		return birthday;
	}


	public void setBirthday(Long birthday) {
		this.birthday = birthday;
	}

	public static class DiaryKidPerson {
		private String personId, gender, fullName, firstName, lastName, relation;
		private List<String> phone, email;
		private boolean parent, _default, authorized, adult;
		private Long birthday;

		public String getPersonId() {
			return personId;
		}
		public void setPersonId(String personId) {
			this.personId = personId;
		}
		public String getGender() {
			return gender;
		}
		public void setGender(String gender) {
			this.gender = gender;
		}
		public String getFullName() {
			return fullName;
		}
		public void setFullName(String fullName) {
			this.fullName = fullName;
		}
		public String getFirstName() {
			return firstName;
		}
		public void setFirstName(String firstName) {
			this.firstName = firstName;
		}
		public String getLastName() {
			return lastName;
		}
		public void setLastName(String lastName) {
			this.lastName = lastName;
		}
		public String getRelation() {
			return relation;
		}
		public void setRelation(String relation) {
			this.relation = relation;
		}
		public List<String> getPhone() {
			return phone;
		}
		public void setPhone(List<String> phone) {
			this.phone = phone;
		}
		public List<String> getEmail() {
			return email;
		}
		public void setEmail(List<String> email) {
			this.email = email;
		}
		public boolean isParent() {
			return parent;
		}
		public void setParent(boolean parent) {
			this.parent = parent;
		}
		public boolean isDefault() {
			return _default;
		}
		public void setDefault(boolean _default) {
			this._default = _default;
		}
		public boolean isAuthorized() {
			return authorized;
		}
		public void setAuthorized(boolean authorized) {
			this.authorized = authorized;
		}
		public boolean isAdult() {
			return adult;
		}
		public void setAdult(boolean adult) {
			this.adult = adult;
		}
		public Long getBirthday() {
			return birthday;
		}
		public void setBirthday(Long birthday) {
			this.birthday = birthday;
		}
		
		
		
	}
}
