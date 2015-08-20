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
public class KidCalAssenza extends SchoolObject {

	public static class Reason {
		private String type;
		private String subtype;
		public String getType() {
			return type;
		}
		public void setType(String type) {
			this.type = type;
		}
		public String getSubtype() {
			return subtype;
		}
		public void setSubtype(String subtype) {
			this.subtype = subtype;
		}
	}
	
	private String kidId, note;
	private long dateFrom, dateTo;
	private Reason reason;
	
	
	public String getKidId() {
		return kidId;
	}
	public void setKidId(String kidId) {
		this.kidId = kidId;
	}
	public String getNote() {
		return note;
	}
	public void setNote(String note) {
		this.note = note;
	}
	public long getDateFrom() {
		return dateFrom;
	}
	public void setDateFrom(long dateFrom) {
		this.dateFrom = dateFrom;
	}
	public long getDateTo() {
		return dateTo;
	}
	public void setDateTo(long dateTo) {
		this.dateTo = dateTo;
	}
	public Reason getReason() {
		return reason;
	}
	public void setReason(Reason reason) {
		this.reason = reason;
	}
}
