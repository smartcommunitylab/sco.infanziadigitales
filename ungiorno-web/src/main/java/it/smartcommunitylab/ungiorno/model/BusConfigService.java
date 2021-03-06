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
public class BusConfigService extends ConfigService {

	private String defaultIdGo, defaultIdBack;

	public String getDefaultIdGo() {
		return defaultIdGo;
	}

	public void setDefaultIdGo(String defaultIdGo) {
		this.defaultIdGo = defaultIdGo;
	}

	public String getDefaultIdBack() {
		return defaultIdBack;
	}

	public void setDefaultIdBack(String defaultIdBack) {
		this.defaultIdBack = defaultIdBack;
	}

}
