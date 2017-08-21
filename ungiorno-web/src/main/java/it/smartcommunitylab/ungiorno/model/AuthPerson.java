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
public class AuthPerson {

	private String personId, fullName, firstName, lastName, relation, authorizationUrl;
	private List<String> phone, email;
	private long authorizationDeadline;
	boolean adult, parent, _default;

	public AuthPerson() {
		super();
	}
	public AuthPerson(String id, String rel,  boolean _default) {
		this.personId = id;
		this._default = _default;
		this.parent = true;
		this.relation = rel;
	}
	public String getPersonId() {
		return personId;
	}
	public void setPersonId(String personId) {
		this.personId = personId;
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
	public String getAuthorizationUrl() {
		return authorizationUrl;
	}
	public void setAuthorizationUrl(String authorizationUrl) {
		this.authorizationUrl = authorizationUrl;
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
	public long getAuthorizationDeadline() {
		return authorizationDeadline;
	}
	public void setAuthorizationDeadline(long authorizationDeadline) {
		this.authorizationDeadline = authorizationDeadline;
	}
	public boolean isAdult() {
		return adult;
	}
	public void setAdult(boolean adult) {
		this.adult = adult;
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
	/**
	 * @return
	 */
	public DiaryKidPerson toDiaryKidPerson(boolean authorized) {
		DiaryKidPerson p = new DiaryKidPerson();
		p.setAdult(adult);
		p.setAuthorized(authorized);
		p.setDefault(_default);
		p.setEmail(email);
		p.setFirstName(firstName);
		p.setFullName(fullName);
		p.setLastName(lastName);
		p.setParent(parent);
		p.setPersonId(personId);
		p.setPhone(phone);
		p.setRelation(relation);
		return p;
	}


}
