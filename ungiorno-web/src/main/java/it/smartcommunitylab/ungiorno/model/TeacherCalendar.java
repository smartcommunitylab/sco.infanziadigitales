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
public class TeacherCalendar {

	public static class TeacherEvent {
		private List<String> teachers;
		private String what;
		private long from, to;
		public List<String> getTeachers() {
			return teachers;
		}
		public void setTeachers(List<String> teachers) {
			this.teachers = teachers;
		}
		public String getWhat() {
			return what;
		}
		public void setWhat(String what) {
			this.what = what;
		}
		public long getFrom() {
			return from;
		}
		public void setFrom(long from) {
			this.from = from;
		}
		public long getTo() {
			return to;
		}
		public void setTo(long to) {
			this.to = to;
		}
	}
	
	private int timeDivisionInterval;
	private List<TeacherEvent> events;
	
	public int getTimeDivisionInterval() {
		return timeDivisionInterval;
	}
	public void setTimeDivisionInterval(int timeDivisionInterval) {
		this.timeDivisionInterval = timeDivisionInterval;
	}
	public List<TeacherEvent> getEvents() {
		return events;
	}
	public void setEvents(List<TeacherEvent> events) {
		this.events = events;
	}
	
}
