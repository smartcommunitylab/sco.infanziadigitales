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

import it.smartcommunitylab.ungiorno.diary.model.DiaryKid;
import it.smartcommunitylab.ungiorno.importer.ImportError;
import it.smartcommunitylab.ungiorno.importer.Importer;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.security.AppDetails;
import it.smartcommunitylab.ungiorno.storage.App;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;
import it.smartcommunitylab.ungiorno.usage.UsageManager;

import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
	private UsageManager usageManager;
	
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
			String schoolId = req.getParameter("schoolId");
			String appId = getAppId();
			
			Importer importer = new Importer();
			
			if (multiFileMap.containsKey("schoolData")) {
				importer.importSchoolData(appId, schoolId, multiFileMap.getFirst("schoolData").getInputStream());
				SchoolProfile profile = importer.getSchoolProfile();
				storage.storeSchoolProfile(profile);
				List<Teacher> teachers = importer.getTeachers();
				storage.updateTeachers(appId, schoolId, teachers);
			}
			if (multiFileMap.containsKey("childrenData")) {
				importer.importChildrenData(appId, schoolId, multiFileMap.getFirst("childrenData").getInputStream());
				storage.updateChildren(appId, schoolId, importer.getChildren());
				storage.updateParents(appId, schoolId, importer.getParents());
				storage.updateKidBusData(appId, schoolId, importer.getBusData());
			}
			res = new ObjectMapper().writeValueAsString(storage.getApp(appId));
		} catch (ImportError e) {
			System.err.println("ERROR:" + e.getMessage());
			res = new ObjectMapper().writeValueAsString(e);
		}
		return res;
	}

	@RequestMapping(value = "/updateauthorizations", method = RequestMethod.POST)
	public @ResponseBody String uploadAuthoriz(MultipartHttpServletRequest req) throws Exception {
		MultiValueMap<String, MultipartFile> multiFileMap = req.getMultiFileMap();
		String res = "";

		try {
			String schoolId = req.getParameter("schoolId");
			String appId = getAppId();
			
			Importer importer = new Importer();
			
			if (multiFileMap.containsKey("childrenData")) {
				importer.importChildrenData(appId, schoolId, multiFileMap.getFirst("childrenData").getInputStream());
				storage.updateAuthorizations(appId, schoolId, importer.getChildren());
			}
		} catch (ImportError e) {
			System.err.println("ERROR:" + e.getMessage());
			res = new ObjectMapper().writeValueAsString(e);
		}
		return res;
	}
	
	@RequestMapping(value = "/updatediary", method = RequestMethod.POST)
	public @ResponseBody String uploadDiary(HttpServletRequest req) throws Exception {
		String res = "";
		String schoolId = req.getParameter("schoolId");
		String appId = getAppId();
		List<DiaryKid> response = storage.updateDiaryKidPersons(appId, schoolId);
		res = new ObjectMapper().writeValueAsString(response);
		return res;
	}
	
	@RequestMapping(value = "/downloadcsv", method = RequestMethod.POST)
	public void downloadCSV(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		String res = "";
		String schoolId = req.getParameter("schoolId");
		String appId = getAppId();
		
		String result = usageManager.generateCSV(appId, schoolId);
		
		resp.setContentType("application/csv; charset=utf-8");
		resp.setHeader("Content-Disposition", "attachment; filename=\"usage_" + schoolId + ".csv\"");
		resp.getWriter().write(result);
	}	
	
	private String getAppId() {
		AppDetails details = (AppDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		String app = details.getUsername();
		return app;
	}


}
