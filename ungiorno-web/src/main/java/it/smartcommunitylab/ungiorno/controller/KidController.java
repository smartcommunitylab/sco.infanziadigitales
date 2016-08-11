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

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidCalAssenza;
import it.smartcommunitylab.ungiorno.model.KidCalEntrata;
import it.smartcommunitylab.ungiorno.model.KidCalRitiro;
import it.smartcommunitylab.ungiorno.model.KidConfig;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class KidController {
	private static final transient Logger logger = LoggerFactory.getLogger(KidController.class);
			
	@Autowired
	@Value("${image.download.dir}")
	private String imageDownloadDir;
	
	@Autowired
	private RepositoryManager storage;

	@Autowired
	private PermissionsManager permissions;

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/profiles")
	public @ResponseBody Response<List<KidProfile>> getProfiles(@PathVariable String appId) 
			throws ProfileNotFoundException {
		
		//TODO come mai manca controllo dei permessi?
		String userId = permissions.getUserId();
		List<KidProfile> profiles = storage.getKidProfilesByParent(appId, userId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getProfiles[%s]", appId));
		}
		return new Response<>(profiles);
	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/profile")
	public @ResponseBody Response<KidProfile> getProfile(@PathVariable String appId,
			@PathVariable String schoolId, @PathVariable String kidId) {

		if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
			return new Response<>();
		}
		KidProfile profile = storage.getKidProfile(appId, schoolId, kidId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getProfile[%s]: %s - %s", appId, schoolId, kidId));
		}
		return new Response<>(profile);
	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/config")
	public @ResponseBody Response<KidConfig> getConfig(@PathVariable String appId,
			@PathVariable String schoolId, @PathVariable String kidId) {
		
		if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
			return new Response<>();
		}
		KidConfig profile = storage.getKidConfig(appId, schoolId, kidId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getConfig[%s]: %s - %s", appId, schoolId, kidId));
		}		
		return new Response<>(profile);
	}

	@RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/config")
	public @ResponseBody Response<KidConfig> sendConfig(@RequestBody KidConfig config,
			@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {
		
		if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
			return new Response<>();
		}

		config.setAppId(appId);
		config.setKidId(kidId);
		config.setSchoolId(schoolId);

		config = storage.saveConfig(config);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("sendConfig[%s]: %s - %s", appId, schoolId, kidId));
		}		
		return new Response<>(config);
	}

	@RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/entrata")
	public @ResponseBody Response<KidCalEntrata> sendEntrata(@RequestBody KidCalEntrata entrata,
			@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
				return new Response<>();
			}
			entrata.setAppId(appId);
			entrata.setSchoolId(schoolId);
			entrata.setKidId(kidId);
			KidCalEntrata result = storage.saveEntrata(entrata);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("sendEntrata[%s]: %s - %s", appId, schoolId, kidId));
			}
			return new Response<>(result);
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/entrata")
	public @ResponseBody Response<KidCalEntrata> getEntrata(@PathVariable String appId,
			@PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {
		if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
			return new Response<>();
		}
		KidCalEntrata entrata = storage.getEntrata(appId, schoolId, kidId, date);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getEntrata[%s]: %s - %s", appId, schoolId, kidId));
		}		
		return new Response<>(entrata);
	}
	
	@RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/ritiro")
	public @ResponseBody Response<KidCalRitiro> sendRitiro(@RequestBody KidCalRitiro ritiro,
			@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {
		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
				return new Response<>();
			}
			ritiro.setAppId(appId);
			ritiro.setSchoolId(schoolId);
			ritiro.setKidId(kidId);
			KidCalRitiro result = storage.saveRitiro(ritiro);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("sendRitiro[%s]: %s - %s", appId, schoolId, kidId));
			}			
			return new Response<>(result);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/ritiro")
	public @ResponseBody Response<KidCalRitiro> getRitiro(@PathVariable String appId,
			@PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {
		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
				return new Response<>();
			}
			KidCalRitiro ritiro = storage.getRitiro(appId, schoolId, kidId, date);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("getRitiro[%s]: %s - %s", appId, schoolId, kidId));
			}			
			return new Response<>(ritiro);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/absence")
	public @ResponseBody Response<KidCalAssenza> sendAssenza(@RequestBody KidCalAssenza absence,
			@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

		if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
			return new Response<>();
		}
		absence.setAppId(appId);
		absence.setKidId(kidId);
		absence.setSchoolId(schoolId);
		KidCalAssenza assenza = storage.saveAbsence(absence);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("sendAssenza[%s]: %s - %s", appId, schoolId, kidId));
		}		
		return new Response<>(assenza);
	}

	@RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/absence")
	public @ResponseBody Response<KidCalAssenza> getAssenza(@PathVariable String appId,
			@PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {

		try {
			if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
				return new Response<>();
			}
			KidCalAssenza obj = storage.getAbsence(appId, schoolId, kidId, date);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("getAssenza[%s]: %s - %s", appId, schoolId, kidId));
			}			
			return new Response<>(obj);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET,	value = "/student/{appId}/{schoolId}/{kidId}/communications")
	public @ResponseBody Response<List<Communication>> getComms(@PathVariable String appId,
			@PathVariable String schoolId, @PathVariable String kidId) {

		if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
			return new Response<>();
		}
		List<Communication> list = storage.getKidCommunications(appId, schoolId, kidId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getComms[%s]: %s - %s - %d", appId, schoolId, kidId, list.size()));
		}		
		return new Response<>(list);
	}

	@RequestMapping(value = "/student/{appId}/{schoolId}/{kidId}/{isTeacher}/images", method = RequestMethod.GET)
	public @ResponseBody HttpEntity<byte[]> downloadImage(@PathVariable String appId,	
			@PathVariable String schoolId, @PathVariable String kidId, @PathVariable Boolean isTeacher,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.IMAGE_PNG);
    headers.setContentLength(0);
    
		/*if (!permissions.checkKidProfile(appId, schoolId, kidId, isTeacher)) {
			return new HttpEntity<byte[]>(new byte[0], headers);
		}*/
		KidProfile profile = storage.getKidProfile(appId, schoolId, kidId);
		String name = profile.getImage();
		String path = imageDownloadDir + "/" + name;
		FileInputStream in = null;
		try {
			in = new FileInputStream(new File(path));
		} catch (FileNotFoundException e) {
			name = "placeholder_child.png";
			path = imageDownloadDir + "/" + name;
			in = new FileInputStream(new File(path));
		}
		byte[] image = IOUtils.toByteArray(in);
		headers.setContentLength(image.length);
		String extension = name.substring(name.lastIndexOf("."));
		if(extension.toLowerCase().equals(".png")) {
			headers.setContentType(MediaType.IMAGE_PNG);
		} else if(extension.toLowerCase().equals(".gif")) {
			headers.setContentType(MediaType.IMAGE_GIF);
		} else if(extension.toLowerCase().equals(".jpg")) {
			headers.setContentType(MediaType.IMAGE_JPEG);
		} else if(extension.toLowerCase().equals(".jpeg")) {
			headers.setContentType(MediaType.IMAGE_JPEG);
		}
    return new HttpEntity<byte[]>(image, headers);
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public String handleError(HttpServletRequest request, Exception exception) {
		return "{\"error\":\"" + exception.getMessage() + "\"}";
	}
	
	@ExceptionHandler(ProfileNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	@ResponseBody
	public String handleProfileNotFoundError(HttpServletRequest request, Exception exception) {
		return "{\"error\":\"" + exception.getMessage() + "\"}";
	}

}
