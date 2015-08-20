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
public class Menu extends SchoolObject {

	public static class Meal {
		private String type, name;

		public String getType() {
			return type;
		}

		public void setType(String type) {
			this.type = type;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}
	}
	
	private long date;
	private List<Meal> lunch, _break;
	public long getDate() {
		return date;
	}
	public void setDate(long date) {
		this.date = date;
	}
	public List<Meal> getLunch() {
		return lunch;
	}
	public void setLunch(List<Meal> lunch) {
		this.lunch = lunch;
	}
	public List<Meal> getBreak() {
		return _break;
	}
	public void setBreak(List<Meal> merenda) {
		this._break = merenda;
	}
	
	
	
}
