/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
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
 */

package it.smartcommunitylab.ungiorno.controller;

import it.smartcommunitylab.ungiorno.importer.ImportError;
import it.smartcommunitylab.ungiorno.importer.Importer;
import it.smartcommunitylab.ungiorno.security.AppDetails;
import it.smartcommunitylab.ungiorno.storage.App;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.fasterxml.jackson.databind.ObjectMapper;


@Controller
public class ConsoleController {

	@Autowired
	private ServletContext context;

	@Autowired
	private RepositoryManager storage;

	@Autowired
	private Importer importer;

	@Autowired
	private AppSetup appSetup;

	@RequestMapping(value = "/")
	public String root() {
		return "index";
	}

	@RequestMapping(value = "/login")
	public String login() {
		return "login";
	}

	@RequestMapping(value = "/console/data")
	public @ResponseBody App data() {
		return storage.getApp(getAppId());
	}

	@RequestMapping(value = "/savefiles", method = RequestMethod.POST)
	public @ResponseBody String upload(MultipartHttpServletRequest req) throws Exception {
		MultiValueMap<String, MultipartFile> multiFileMap = req.getMultiFileMap();
		String res = "";

		try {
			String appId = getAppId();
			for (String key : multiFileMap.keySet()) {
				importer.importData(appId, key, multiFileMap.getFirst(key));
			}
		} catch (ImportError e) {
			res = new ObjectMapper().writeValueAsString(e);
		}
		return res;
	}

	private String getAppId() {
		AppDetails details = (AppDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		String app = details.getUsername();
		return app;
	}


}
