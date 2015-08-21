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
public class KidConfig extends SchoolObject {

	private String kidId;
	private ConfigServices services;
	private List<AuthPerson> extraPersons;

	private String exitTime;
	private String defaultPerson;
	private boolean receiveNotification;
	public String getKidId() {
		return kidId;
	}
	public void setKidId(String kidId) {
		this.kidId = kidId;
	}
	public ConfigServices getServices() {
		return services;
	}
	public void setServices(ConfigServices services) {
		this.services = services;
	}
	public List<AuthPerson> getExtraPersons() {
		return extraPersons;
	}
	public void setExtraPersons(List<AuthPerson> extraPersons) {
		this.extraPersons = extraPersons;
	}
	public String getExitTime() {
		return exitTime;
	}
	public void setExitTime(String exitTime) {
		this.exitTime = exitTime;
	}
	public String getDefaultPerson() {
		return defaultPerson;
	}
	public void setDefaultPerson(String defaultPerson) {
		this.defaultPerson = defaultPerson;
	}
	public boolean isReceiveNotification() {
		return receiveNotification;
	}
	public void setReceiveNotification(boolean receiveNotification) {
		this.receiveNotification = receiveNotification;
	}


}
