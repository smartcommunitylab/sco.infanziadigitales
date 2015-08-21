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
public class BusData extends SchoolObject{

	public static class KidProfile {
		private String kidId, personWhoWaitName, personWhoWaitRelation, fullName, busStop, image;

		public String getKidId() {
			return kidId;
		}

		public void setKidId(String kidId) {
			this.kidId = kidId;
		}

		public String getPersonWhoWaitName() {
			return personWhoWaitName;
		}

		public void setPersonWhoWaitName(String personWhoWaitName) {
			this.personWhoWaitName = personWhoWaitName;
		}

		public String getPersonWhoWaitRelation() {
			return personWhoWaitRelation;
		}

		public void setPersonWhoWaitRelation(String personWhoWaitRelation) {
			this.personWhoWaitRelation = personWhoWaitRelation;
		}

		public String getFullName() {
			return fullName;
		}

		public void setFullName(String fullName) {
			this.fullName = fullName;
		}

		public String getBusStop() {
			return busStop;
		}

		public void setBusStop(String busStop) {
			this.busStop = busStop;
		}

		public String getImage() {
			return image;
		}

		public void setImage(String image) {
			this.image = image;
		}
	}

	public static class Bus {
		private String busId, busName;
		private List<KidProfile> children;
		public String getBusId() {
			return busId;
		}
		public void setBusId(String busId) {
			this.busId = busId;
		}
		public String getBusName() {
			return busName;
		}
		public void setBusName(String busName) {
			this.busName = busName;
		}
		public List<KidProfile> getChildren() {
			return children;
		}
		public void setChildren(List<KidProfile> children) {
			this.children = children;
		}
	}

	private long date;
	private List<Bus> buses;
	public long getDate() {
		return date;
	}
	public void setDate(long date) {
		this.date = date;
	}
	public List<Bus> getBuses() {
		return buses;
	}
	public void setBuses(List<Bus> buses) {
		this.buses = buses;
	}

}
