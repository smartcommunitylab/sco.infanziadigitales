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
public class ConfigServices {

	private ConfigService anticipo, posticipo, mensa;
	private BusConfigService bus;
	public ConfigService getAnticipo() {
		return anticipo;
	}
	public void setAnticipo(ConfigService anticipo) {
		this.anticipo = anticipo;
	}
	public ConfigService getPosticipo() {
		return posticipo;
	}
	public void setPosticipo(ConfigService posticipo) {
		this.posticipo = posticipo;
	}
	public ConfigService getMensa() {
		return mensa;
	}
	public void setMensa(ConfigService mensa) {
		this.mensa = mensa;
	}
	public BusConfigService getBus() {
		return bus;
	}
	public void setBus(BusConfigService bus) {
		this.bus = bus;
	}

}
