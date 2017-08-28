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

/**
 * @author raman
 *
 */
public class KidCalRitiro extends SchoolObject {

	private String kidId, personId, note;
	private long date;
	private boolean exceptional;

	public String getKidId() {
		return kidId;
	}
	public void setKidId(String kidId) {
		this.kidId = kidId;
	}
	public String getPersonId() {
		return personId;
	}
	public void setPersonId(String personId) {
		this.personId = personId;
	}
	public String getNote() {
		return note;
	}
	public void setNote(String note) {
		this.note = note;
	}
	public long getDate() {
		return date;
	}
	public void setDate(long date) {
		this.date = date;
	}


	public boolean isExceptional() {
		return exceptional;
	}
	public void setExceptional(boolean exceptional) {
		this.exceptional = exceptional;
	}


	private String _id;

	public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
	}

}