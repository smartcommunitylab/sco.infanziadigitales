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
public class SectionData extends SchoolObject{

	public static class ServiceProfile {
		private boolean enabled, active;

		public ServiceProfile() {
			super();
		}

		public ServiceProfile(boolean enabled, boolean active) {
			super();
			this.enabled = enabled;
			this.active = active;
		}

		public boolean isEnabled() {
			return enabled;
		}

		public void setEnabled(boolean enabled) {
			this.enabled = enabled;
		}

		public boolean isActive() {
			return active;
		}

		public void setActive(boolean active) {
			this.active = active;
		}
	}

	public static class KidProfile {
		private String kidId, childrenName, image;
		private ServiceProfile anticipo, posticipo, mensa, bus;
		private Long exitTime;
		
		private String personId;
		private String personName;
		private boolean personException, stopException;
		private String note;
		private String stopId;
		
		public String getKidId() {
			return kidId;
		}
		public void setKidId(String kidId) {
			this.kidId = kidId;
		}
		public String getChildrenName() {
			return childrenName;
		}
		public void setChildrenName(String childrenName) {
			this.childrenName = childrenName;
		}
		public String getImage() {
			return image;
		}
		public void setImage(String image) {
			this.image = image;
		}
		public ServiceProfile getAnticipo() {
			return anticipo;
		}
		public void setAnticipo(ServiceProfile anticipo) {
			this.anticipo = anticipo;
		}
		public ServiceProfile getPosticipo() {
			return posticipo;
		}
		public void setPosticipo(ServiceProfile posticipo) {
			this.posticipo = posticipo;
		}
		public ServiceProfile getMensa() {
			return mensa;
		}
		public void setMensa(ServiceProfile mensa) {
			this.mensa = mensa;
		}
		public Long getExitTime() {
			return exitTime;
		}
		public void setExitTime(Long exitTime) {
			this.exitTime = exitTime;
		}
		public ServiceProfile getBus() {
			return bus;
		}
		public void setBus(ServiceProfile bus) {
			this.bus = bus;
		}
		public String getPersonId() {
			return personId;
		}
		public void setPersonId(String personId) {
			this.personId = personId;
		}
		public boolean isPersonException() {
			return personException;
		}
		public void setPersonException(boolean personException) {
			this.personException = personException;
		}
		public String getPersonName() {
			return personName;
		}
		public void setPersonName(String personName) {
			this.personName = personName;
		}
		public String getStopId() {
			return stopId;
		}
		public void setStopId(String stopId) {
			this.stopId = stopId;
		}
		public String getNote() {
			return note;
		}
		public void setNote(String note) {
			this.note = note;
		}
		public boolean isStopException() {
			return stopException;
		}
		public void setStopException(boolean stopException) {
			this.stopException = stopException;
		}
	}

	private String sectionId, sectionName;
	private List<KidProfile> children;
	public String getSectionId() {
		return sectionId;
	}
	public void setSectionId(String sectionId) {
		this.sectionId = sectionId;
	}
	public String getSectionName() {
		return sectionName;
	}
	public void setSectionName(String sectionName) {
		this.sectionName = sectionName;
	}
	public List<KidProfile> getChildren() {
		return children;
	}
	public void setChildren(List<KidProfile> children) {
		this.children = children;
	}

	

}