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
public class SchoolProfile extends SchoolObject {

	public static class Timing {
		private String fromTime, toTime;
		public String getFromTime() {
			return fromTime;
		}
		public void setFromTime(String fromTime) {
			this.fromTime = fromTime;
		}
		public String getToTime() {
			return toTime;
		}
		public void setToTime(String toTime) {
			this.toTime = toTime;
		}
	}

	private Timing regularTiming, anticipoTiming, posticipoTiming;
	private Contact contacts;
	private List<TypeDef> absenceTypes;
	private List<TypeDef> frequentIllnesses;
	private List<TypeDef> teacherNoteTypes;
	private List<TypeDef> foodTypes;
	public Timing getRegularTiming() {
		return regularTiming;
	}
	public void setRegularTiming(Timing regularTiming) {
		this.regularTiming = regularTiming;
	}
	public Contact getContacts() {
		return contacts;
	}
	public void setContacts(Contact contacts) {
		this.contacts = contacts;
	}
	public List<TypeDef> getAbsenceTypes() {
		return absenceTypes;
	}
	public void setAbsenceTypes(List<TypeDef> absenceTypes) {
		this.absenceTypes = absenceTypes;
	}
	public List<TypeDef> getFrequentIllnesses() {
		return frequentIllnesses;
	}
	public void setFrequentIllnesses(List<TypeDef> frequentIllnesses) {
		this.frequentIllnesses = frequentIllnesses;
	}
	public List<TypeDef> getTeacherNoteTypes() {
		return teacherNoteTypes;
	}
	public void setTeacherNoteTypes(List<TypeDef> teacherNoteTypes) {
		this.teacherNoteTypes = teacherNoteTypes;
	}
	public List<TypeDef> getFoodTypes() {
		return foodTypes;
	}
	public void setFoodTypes(List<TypeDef> foodTypes) {
		this.foodTypes = foodTypes;
	}
	public Timing getAnticipoTiming() {
		return anticipoTiming;
	}
	public void setAnticipoTiming(Timing anticipoTiming) {
		this.anticipoTiming = anticipoTiming;
	}
	public Timing getPosticipoTiming() {
		return posticipoTiming;
	}
	public void setPosticipoTiming(Timing posticipoTiming) {
		this.posticipoTiming = posticipoTiming;
	}


}
