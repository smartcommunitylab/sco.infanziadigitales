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
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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

import com.google.common.collect.Sets;

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.model.CalendarItem;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidCalAssenza;
import it.smartcommunitylab.ungiorno.model.KidCalFermata;
import it.smartcommunitylab.ungiorno.model.KidCalNote;
import it.smartcommunitylab.ungiorno.model.KidCalNote.Note;
import it.smartcommunitylab.ungiorno.model.KidCalRitiro;
import it.smartcommunitylab.ungiorno.model.KidConfig;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.KidProfile.DayDefault;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.SchoolObject;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.services.PermissionsService;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.usage.UsageManager;
import it.smartcommunitylab.ungiorno.utils.JsonUtil;

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
    private UsageManager usageManager;

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/calendar")
    public @ResponseBody Response<List<CalendarItem>> getCalendar(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long from,
            @RequestParam long to) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            List<CalendarItem> list = storage.getCalendar(appId, schoolId, kidId, from, to);
            return new Response<>(list);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }

    }

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

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/config")
    public @ResponseBody Response<KidConfig> getConfig(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            KidConfig profile = storage.getKidConfig(appId, schoolId, kidId);
            return new Response<>(profile);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/student/{appId}/{schoolId}/{kidId}/config")
    public @ResponseBody Response<KidConfig> sendConfig(@RequestBody KidConfig config,
            @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            config.setAppId(appId);
            config.setKidId(kidId);
            config.setSchoolId(schoolId);

            config = storage.saveConfig(config);
            return new Response<>(config);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.POST, value = "/student/{appId}/{schoolId}/{kidId}/stop")
    public @ResponseBody Response<KidConfig> sendStop(@RequestBody KidCalFermata stop,
            @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            stop.setAppId(appId);
            stop.setKidId(kidId);
            stop.setSchoolId(schoolId);

            KidConfig config = storage.saveStop(stop);

            usageManager.kidReturn(appId, schoolId, kidId, true);

            return new Response<>(config);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/stop")
    public @ResponseBody Response<KidCalFermata> getStop(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            KidCalFermata obj = storage.getStop(appId, schoolId, kidId, date);
            return new Response<>(obj);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/student/{appId}/{schoolId}/{kidId}/absence")
    public @ResponseBody Response<KidConfig> sendAssenza(@RequestBody KidCalAssenza absence,
            @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
                return new Response<>();
            }

            absence.setAppId(appId);
            absence.setKidId(kidId);
            absence.setSchoolId(schoolId);

            KidConfig config = storage.saveAbsence(absence);

            usageManager.kidAbsence(appId, schoolId, kidId);

            return new Response<>(config);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/absence")
    public @ResponseBody Response<KidCalAssenza> getAssenza(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            KidCalAssenza obj = storage.getAbsence(appId, schoolId, kidId, date);
            return new Response<>(obj);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/student/{appId}/{schoolId}/{kidId}/return")
    public @ResponseBody Response<KidConfig> sendRitiro(@RequestBody KidCalRitiro ritiro,
            @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
                return new Response<>();
            }

            ritiro.setAppId(appId);
            ritiro.setKidId(kidId);
            ritiro.setSchoolId(schoolId);

            KidConfig config = storage.saveReturn(ritiro);

            usageManager.kidReturn(appId, schoolId, kidId, false);

            return new Response<>(config);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/return")
    public @ResponseBody Response<KidCalRitiro> getRitiro(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            if (logger.isDebugEnabled()) {
                logger.debug("reading ritiro:" + appId + " - " + schoolId + " - " + kidId + " - "
                        + date);
            }
            KidCalRitiro obj = storage.getReturn(appId, schoolId, kidId, date);
            if (logger.isDebugEnabled()) {
                logger.debug("reading ritiro: result " + JsonUtil.convertObject(obj));
            }
            return new Response<>(obj);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/{kidId}/notes")
    public @ResponseBody Response<List<KidCalNote>> getNotes(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long date) {

        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, null)) {
                return new Response<>();
            }

            List<KidCalNote> list = storage.getKidCalNotes(appId, schoolId, kidId, date);
            return new Response<>(list);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }

    }

    @RequestMapping(method = RequestMethod.GET, value = "/student/{appId}/{schoolId}/notes")
    public @ResponseBody Response<List<KidCalNote>> getSectionNotes(@PathVariable String appId,
            @PathVariable String schoolId, @RequestParam(required = false) String[] sectionIds,
            @RequestParam long date) {

        Set<String> sIds;
        if (sectionIds != null) {
            sIds = Sets.newHashSet(sectionIds);
        } else {
            sIds = Sets.newHashSet();
        }

        if (!permissions.isSchoolTeacher(appId, schoolId, permissions.getUserId())) {
            throw new SecurityException("User is not associated to this school");
        }

        // Teacher teacher = storage.getTeacher(permissions.getUserId(), appId,
        // schoolId);
        //
        // if (teacher == null) {
        // return new Response<>();
        // }
        //
        // storage.getSchoolProfile(appId, schoolId).getSections();
        //
        // Set<String> tsIds = Sets.newHashSet(teacher.getSectionIds());
        //
        // SetView sv = Sets.intersection(sIds, tsIds);
        // String[] sections = (String[]) Lists.newArrayList(sv).toArray(new
        // String[] {});

        try {
            List<KidCalNote> list =
                    storage.getKidCalNotesForSection(appId, schoolId, sectionIds, date);
            return new Response<>(list);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }

    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/student/{appId}/{schoolId}/{kidId}/notes")
    public @ResponseBody Response<KidCalNote> saveNote(@RequestBody KidCalNote note,
            @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId,
            @RequestParam(required = false) String pin) {

        try {
            long now = System.currentTimeMillis();
            note.setAppId(appId);
            note.setKidId(kidId);
            note.setSchoolId(schoolId);
            if (note.getParentNotes() != null && !note.getParentNotes().isEmpty()) {
                if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
                    return new Response<>();
                }

                Parent parent = storage.getParent(permissions.getUserId(), appId, schoolId);
                if (parent == null)
                    throw new IllegalArgumentException("No person registered");
                for (Note n : note.getParentNotes()) {
                    n.setDate(now);
                    n.setPersonId(parent.getPersonId());
                }
            } else if (note.getSchoolNotes() != null && !note.getSchoolNotes().isEmpty()) {
                if (!permissions.checkKidProfile(appId, schoolId, kidId, true)) {
                    return new Response<>();
                }

                Teacher teacher = storage.getTeacherByPin(pin, appId, schoolId);
                if (teacher == null)
                    throw new IllegalArgumentException("No teacher registered");
                for (Note n : note.getSchoolNotes()) {
                    n.setDate(now);
                    n.setPersonId(teacher.getTeacherId());
                }
            } else {
                throw new IllegalArgumentException("Incorrect note");
            }

            return new Response<>(storage.saveNote(note));
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }

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

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/{appId}/{schoolId}/{kidId}/returns-or-stops")
    public @ResponseBody Response<List<SchoolObject>> getReturnsOrStops(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId, @RequestParam long from,
            @RequestParam long to) {
        List<SchoolObject> result = new ArrayList<SchoolObject>();
        try {
            if (!permissions.checkKidProfile(appId, schoolId, kidId, false)) {
                return new Response<>();
            }
            List<KidCalFermata> stops = storage.getStop(appId, schoolId, kidId, from, to);
            if (stops != null) {
                result.addAll(stops);
            }
            List<KidCalRitiro> returns = storage.getReturn(appId, schoolId, kidId, from, to);
            if (returns != null) {
                result.addAll(returns);
            }
            return new Response<>(result);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
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
