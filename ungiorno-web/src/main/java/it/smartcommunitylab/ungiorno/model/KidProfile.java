/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.joda.time.DateTime;
import org.springframework.util.StringUtils;

import it.smartcommunitylab.ungiorno.diary.model.DiaryTeacher;

/**
 * @author raman
 *
 */
public class KidProfile extends SchoolObject {

	public static final String DS_TOUPDATE = "toupdate";
	public static final String DS_UPDATED = "updated";
	
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

    public static class DayDefault {
        private String name, delega_name;
        private DateTime entrata, uscita;
        private boolean bus;
        private boolean absence;
        private Motivazione motivazione;
        private String fermata;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getFermata() {
            return fermata;
        }

        public void setFermata(String fermata) {
            this.fermata = fermata;
        }

        public DateTime getEntrata() {
            return entrata;
        }

        public void setEntrata(DateTime entrata) {
            this.entrata = entrata;
        }

        public DateTime getUscita() {
            return uscita;
        }

        public void setUscita(DateTime uscita) {
            this.uscita = uscita;
        }

        public String getDelega_name() {
            return delega_name;
        }

        public void setDelega_name(String delega_name) {
            this.delega_name = delega_name;
        }



        public boolean getBus() {
            return bus;
        }

        public void setBus(boolean bus2) {
            this.bus = bus2;
        }

        public boolean getAbsence() {
            return absence;
        }

        public void setAbsence(boolean absence2) {
            this.absence = absence2;
        }

        public Motivazione getMotivazione() {
            return motivazione;
        }

        public void setMotivazione(Motivazione motivazione2) {
            this.motivazione = motivazione2;
        }

    }

    public static class Motivazione {

        private String type, subtype;

        public String getType() {
            return type;
        }

        public void setType(String type2) {
            this.type = type2;
        }

        public String getSubtype() {
            return subtype;
        }

        public void setSubtype(String subtype2) {
            this.subtype = subtype2;
        }

    }

    private String kidId, fullName, lastName, firstName, image;
    private SectionDef section;
    private List<SectionDef> groups = new ArrayList<>();
    private KidServices services;
    private List<AuthPerson> persons;
    private List<Allergy> allergies;
    private boolean active = true;
    private String gender;
    private Date birthDate;
    private boolean partecipateToSperimentation;
    private List<DayDefault> weekdefault;
    private String dataState;

    private List<DiaryTeacher> diaryTeachers;
    private Boolean sharedDiary;

    public String getKidId() {
        return kidId;
    }

    public void setKidId(String kidId) {
        this.kidId = kidId;
    }

    public String getFullName() {
    	if (StringUtils.hasText(fullName)) return fullName;
        return firstName + " "+lastName;
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

    public List<DayDefault> getWeekDef() {
        return this.weekdefault;
    }

    public void setWeekDefault(List<DayDefault> days) {
        this.weekdefault = days;
    }

    public List<Allergy> getAllergies() {
        if (allergies == null) {
            allergies = new ArrayList<KidProfile.Allergy>();
        }
        return allergies;
    }

    public void setAllergies(List<Allergy> allergies) {
        this.allergies = allergies;
    }

    public Boolean getSharedDiary() {
        return sharedDiary;
    }

    public void setSharedDiary(Boolean sharedDiary) {
        this.sharedDiary = sharedDiary;
    }

    public List<DiaryTeacher> getDiaryTeachers() {
        if (diaryTeachers == null) {
            diaryTeachers = new ArrayList<DiaryTeacher>();
        }
        return diaryTeachers;
    }

    public void setDiaryTeachers(List<DiaryTeacher> diaryTeachers) {
        this.diaryTeachers = diaryTeachers;
    }

    private String _id;

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }

        if (this == obj) {
            return true;
        }

        if (obj.getClass() != this.getClass()) {
            return false;
        }

        KidProfile rhs = (KidProfile) obj;
        return new EqualsBuilder().append(kidId, rhs.kidId).isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(31, 7).append(kidId).hashCode();
    }

    @Override
    public String toString() {
        return String.format("[kidId: %s, name: %s, surname: %s]", kidId, firstName, lastName);
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    public boolean isPartecipateToSperimentation() {
        return partecipateToSperimentation;
    }

    public void setPartecipateToSperimentation(boolean partecipateToSperimentation) {
        this.partecipateToSperimentation = partecipateToSperimentation;
    }

    public List<SectionDef> getGroups() {
        return groups;
    }

    public void setGroups(List<SectionDef> groups) {
        this.groups = groups;
    }

    public void removeFromSection() {
        section = null;
    }

	public String getDataState() {
		return dataState;
	}

	public void setDataState(String dataState) {
		this.dataState = dataState;
	}
}
