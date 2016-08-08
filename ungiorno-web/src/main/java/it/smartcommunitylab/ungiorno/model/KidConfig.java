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
public class KidConfig extends SchoolObject {

	private String kidId;
	private String exitTime;
	private String enterTime;
	private String defaultPerson;
	private boolean useBus;
	private String busId;
	private String busStop;
	
	public String getKidId() {
		return kidId;
	}
	public void setKidId(String kidId) {
		this.kidId = kidId;
	}
	public String getExitTime() {
		return exitTime;
	}
	public void setExitTime(String exitTime) {
		this.exitTime = exitTime;
	}
	public String getEnterTime() {
		return enterTime;
	}
	public void setEnterTime(String enterTime) {
		this.enterTime = enterTime;
	}
	public String getDefaultPerson() {
		return defaultPerson;
	}
	public void setDefaultPerson(String defaultPerson) {
		this.defaultPerson = defaultPerson;
	}
	public boolean isUseBus() {
		return useBus;
	}
	public void setUseBus(boolean useBus) {
		this.useBus = useBus;
	}
	public String getBusId() {
		return busId;
	}
	public void setBusId(String busId) {
		this.busId = busId;
	}
	public String getBusStop() {
		return busStop;
	}
	public void setBusStop(String busStop) {
		this.busStop = busStop;
	}
	

}
