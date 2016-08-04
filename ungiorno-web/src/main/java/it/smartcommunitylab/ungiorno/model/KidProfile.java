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

import it.smartcommunitylab.ungiorno.diary.model.DiaryTeacher;

import java.util.List;

import com.google.common.collect.Lists;

/**
 * @author raman
 *
 */
public class KidProfile extends SchoolObject {
	private String kidId, fullName, lastName, firstName, image, gender;
	private KidServices services;
	private List<String> authorizedPersons = Lists.newArrayList();
	private List<String> parents = Lists.newArrayList();
	private List<String> allergies = Lists.newArrayList();
	private List<String> groups = Lists.newArrayList();
	private List<String> ageGroups = Lists.newArrayList();
	private boolean active = true;
	
	private List<DiaryTeacher> diaryTeachers = Lists.newArrayList();
	private Boolean sharedDiary;
	
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
	public String getGender() {
		return gender;
	}
	public void setGender(String gender) {
		this.gender = gender;
	}
	public KidServices getServices() {
		return services;
	}
	public void setServices(KidServices services) {
		this.services = services;
	}
	public List<String> getAuthorizedPersons() {
		return authorizedPersons;
	}
	public void setAuthorizedPersons(List<String> authorizedPersons) {
		this.authorizedPersons = authorizedPersons;
	}
	public List<String> getParents() {
		return parents;
	}
	public void setParents(List<String> parents) {
		this.parents = parents;
	}
	public List<String> getAllergies() {
		return allergies;
	}
	public void setAllergies(List<String> allergies) {
		this.allergies = allergies;
	}
	public List<String> getGroups() {
		return groups;
	}
	public void setGroups(List<String> groups) {
		this.groups = groups;
	}
	public List<String> getAgeGroups() {
		return ageGroups;
	}
	public void setAgeGroups(List<String> ageGroups) {
		this.ageGroups = ageGroups;
	}
	public boolean isActive() {
		return active;
	}
	public void setActive(boolean active) {
		this.active = active;
	}
	public List<DiaryTeacher> getDiaryTeachers() {
		return diaryTeachers;
	}
	public void setDiaryTeachers(List<DiaryTeacher> diaryTeachers) {
		this.diaryTeachers = diaryTeachers;
	}
	public Boolean getSharedDiary() {
		return sharedDiary;
	}
	public void setSharedDiary(Boolean sharedDiary) {
		this.sharedDiary = sharedDiary;
	}
	

}
