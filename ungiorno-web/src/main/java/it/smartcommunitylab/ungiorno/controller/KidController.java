/**
 * Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package it.smartcommunitylab.ungiorno.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.OutputStream;
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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.KidProfile.DayDefault;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.services.PermissionsService;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.services.impl.KidManager;

@RestController
public class KidController {

    private static final transient Logger logger = LoggerFactory.getLogger(KidController.class);

    @Autowired
    @Value("${image.download.dir}")
    private String imageDownloadDir;

    @Autowired
    private RepositoryService storage;

    @Autowired
    private PermissionsService permissions;

    @Autowired
    private KidManager kidManager;

    @RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/profiles")
    public @ResponseBody Response<List<KidProfile>> getProfiles(@PathVariable String appId)
            throws ProfileNotFoundException {

        String userId = permissions.getUserId();
        List<KidProfile> profiles = storage.getKidProfilesByParent(appId, userId);
        return new Response<>(profiles);
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/profile")
    public @ResponseBody Response<KidProfile> getProfile(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            KidProfile profile = storage.getKidProfile(appId, schoolId, kidId);
            return new Response<>(profile);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }

    }

    @Deprecated
    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/config")
    public @ResponseBody Response<Object> getConfig(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId) {

        return new Response<>(null);
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/communications")
    public @ResponseBody Response<List<Communication>> getComms(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            List<Communication> list = storage.getKidCommunications(appId, schoolId, kidId);
            return new Response<>(list);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }



    @RequestMapping(value = "/student/{appId}/{schoolId}/{kidId}/{isTeacher}/images",
            method = RequestMethod.GET)
    public @ResponseBody HttpEntity<byte[]> downloadImage(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId,
            @PathVariable Boolean isTeacher, HttpServletRequest request,
            HttpServletResponse response) throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(0);

        /*
         * if (!permissions.checkKidProfile(appId, schoolId, kidId, isTeacher)) { return new
         * HttpEntity<byte[]>(new byte[0], headers); }
         */
        KidProfile profile = storage.getKidProfile(appId, schoolId, kidId);
        String name = profile.isPartecipateToSperimentation() ? profile.getImage() : "placeholder_child.png";
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
        if (extension.toLowerCase().equals(".png")) {
            headers.setContentType(MediaType.IMAGE_PNG);
        } else if (extension.toLowerCase().equals(".gif")) {
            headers.setContentType(MediaType.IMAGE_GIF);
        } else if (extension.toLowerCase().equals(".jpg")) {
            headers.setContentType(MediaType.IMAGE_JPEG);
        } else if (extension.toLowerCase().equals(".jpeg")) {
            headers.setContentType(MediaType.IMAGE_JPEG);
        }
        return new HttpEntity<byte[]>(image, headers);
    }

    @RequestMapping(value = "/student/{appId}/{schoolId}/{kidId}/{isTeacher}/imagesnew",
            method = RequestMethod.GET)
    public @ResponseBody void downloadImageNew(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId,
            @PathVariable Boolean isTeacher, HttpServletRequest request,
            HttpServletResponse response) throws Exception {

        String path = kidManager.getKidPicturePath(appId, schoolId, kidId, true);
        FileInputStream in = null;
        try {
            in = new FileInputStream(new File(path));
        } catch (FileNotFoundException | NullPointerException e) {
            path = kidManager.getDefaultKidPicturePath();
            in = new FileInputStream(new File(path));
        }
        String extension = path.substring(path.lastIndexOf("."));
        if (extension.toLowerCase().equals(".png")) {
            response.setContentType(MediaType.IMAGE_PNG.toString());
        } else if (extension.toLowerCase().equals(".gif")) {
            response.setContentType(MediaType.IMAGE_GIF.toString());
        } else if (extension.toLowerCase().equals(".jpg")) {
            response.setContentType(MediaType.IMAGE_JPEG.toString());
        } else if (extension.toLowerCase().equals(".jpeg")) {
            response.setContentType(MediaType.IMAGE_JPEG.toString());
        }
        try {
            OutputStream o = response.getOutputStream();
            byte[] buffer = new byte[1024];
            int c = 0;
            int length = 0;
            while ((c = in.read(buffer)) != -1) {
                o.write(buffer, 0, c);
                length += c;
            }
            response.setContentLength(length);
        } catch (IOException e) {
            logger.error("Exception downloading picture for kid {}", kidId);
        } finally {
            in.close();
        }
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/retrieve_default_plan")
    public @ResponseBody Response<List<KidProfile.DayDefault>> getWeekDefault(
            @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {
        try {
            List<KidProfile.DayDefault> returns = storage.getWeekDefault(appId, schoolId, kidId);
            return new Response<>(returns);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/student/{appId}/{schoolId}/{kidId}/set_default_plan")
    public @ResponseBody Response<List<KidProfile.DayDefault>> setWeekDefault(
            @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId,
            @RequestBody List<DayDefault> data) {
        try {
            List<KidProfile.DayDefault> ret = storage.saveWeekDefault(appId, schoolId, kidId, data);
            return new Response<>(ret);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }

    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/{weeknr}/retrieve_specific_week")
    public @ResponseBody Response<List<KidProfile.DayDefault>> getWeekSpecific(
            @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId,
            @PathVariable int weeknr) {
        try {
            List<KidProfile.DayDefault> returns =
                    storage.getWeekSpecific(appId, schoolId, kidId, weeknr);
            return new Response<>(returns);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }

    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/student/{appId}/{schoolId}/{kidId}/{weeknr}/set_specific_week")
    public @ResponseBody Response<List<KidProfile.DayDefault>> setWeekSpecific(
            @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId,
            @PathVariable int weeknr, @RequestBody List<KidProfile.DayDefault> data) {
        try {
            List<KidProfile.DayDefault> ret =
                    storage.saveWeekSpecific(appId, schoolId, kidId, data, weeknr);
            return new Response<>(ret);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }

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
