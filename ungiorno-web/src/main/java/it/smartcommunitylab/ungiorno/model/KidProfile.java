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
import java.util.List;

/**
 * @author raman
 *
 */
public class KidProfile extends SchoolObject {

	public static class Allergy {
		private String name, type;

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getType() {
			return type;
		}

		public void setType(String type) {
			this.type = type;
		}
	}

	private String kidId, fullName, lastName, firstName, image;
	private SectionDef section;
	private KidServices services;
	private List<AuthPerson> persons;
	private List<Allergy> allergies;
	public String getKidId() {
		return kidId;
	}
	public void setKidId(String kidId) {
		this.kidId = kidId;
	}
	public String getFullName() {
		return fullName;
	}
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public SectionDef getSection() {
		return section;
	}
	public void setSection(SectionDef section) {
		this.section = section;
	}
	public KidServices getServices() {
		return services;
	}
	public void setServices(KidServices services) {
		this.services = services;
	}
	public List<AuthPerson> getPersons() {
		return persons;
	}
	public void setPersons(List<AuthPerson> persons) {
		this.persons = persons;
	}
	public List<Allergy> getAllergies() {
		if (allergies == null) allergies = new ArrayList<KidProfile.Allergy>();
		return allergies;
	}
	public void setAllergies(List<Allergy> allergies) {
		this.allergies = allergies;
	}

	private String _id;
	public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
	}
	
}
