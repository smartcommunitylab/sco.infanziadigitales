package it.smartcommunitylab.ungiorno.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import it.smartcommunitylab.ungiorno.beans.GroupDTO;
import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.ConsoleWebUser;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SectionDef;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.services.impl.KidManager;
import it.smartcommunitylab.ungiorno.services.impl.TeacherManager;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.utils.JsonUtil;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

/**
 * ConsoleWebController exposes API used to insert data in system from the web insertion console
 * 
 * @author mirko
 *
 */
@RestController
public class ConsoleWebController {

    private static final transient Logger logger =
            LoggerFactory.getLogger(ConsoleWebController.class);

    @Autowired
    private AppSetup appSetup;

    @Autowired
    private RepositoryService storage;

    @Autowired
    private PermissionsManager permissionsManager;

    @Autowired
    private KidManager kidManager;

    @Autowired
    private TeacherManager teacherManager;

    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/me")
    public Response<List<School>> getMyData(@PathVariable String appId)
            throws ProfileNotFoundException {

        AppInfo appInfo = appSetup.findAppById(appId);
        return new Response<List<School>>(appInfo.getSchools());
    }


    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/profile/me")
    public Response<ConsoleWebUser> getMyProfile() {
        ConsoleWebUser consoleWebUser = new ConsoleWebUser(permissionsManager.getUserId());
        logger.info("login for user {} in console-web", permissionsManager.getUserId());
        List<School> schoolsByAccount =
                appSetup.findSchoolsByAccount(permissionsManager.getUserId());
        consoleWebUser.setAuthorizedSchools(schoolsByAccount);
        return new Response<ConsoleWebUser>(consoleWebUser);
    }



    /*
     * FIXME -> this method clone exactly the ones in SchoolController. Used only because actually
     * console-web is without authentication
     */
    @CrossOrigin
    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/{schoolId}/profile")
    public @ResponseBody Response<SchoolProfile> getSchoolProfile(@PathVariable String appId,
            @PathVariable String schoolId) {
        try {
            SchoolProfile profile = storage.getSchoolProfile(appId, schoolId);
            if (logger.isDebugEnabled()) {
                logger.debug("getSchoolProfile:" + appId + " - " + schoolId + " - "
                        + JsonUtil.convertObject(profile));
            }
            return new Response<SchoolProfile>(profile);
        } catch (Exception e) {
            if (logger.isWarnEnabled()) {
                logger.warn("getSchoolProfile:" + appId + " - " + schoolId);
                logger.warn("error", e);
            }
            return new Response<>(e.getMessage());
        }
    }



    @CrossOrigin
    @RequestMapping(method = RequestMethod.PUT, value = "/consoleweb/{appId}/{schoolId}")
    public Response<SchoolProfile> updateSchool(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody SchoolProfile updatedSchoolProfile)
            throws ProfileNotFoundException {
        updatedSchoolProfile.setAppId(appId);
        updatedSchoolProfile.setSchoolId(schoolId);
        storage.storeSchoolProfile(updatedSchoolProfile);
        return new Response<SchoolProfile>(updatedSchoolProfile);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/{schoolId}/teacher")
    public Response<List<Teacher>> getTeacherProfiles(@PathVariable String appId,
            @PathVariable String schoolId) {
        List<Teacher> teacherProfiles = storage.getTeachers(appId, schoolId);
        return new Response<>(teacherProfiles);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/{schoolId}/kid")
    public @ResponseBody Response<List<KidProfile>> getKidProfiles(@PathVariable String appId,
            @PathVariable String schoolId) throws ProfileNotFoundException {

        List<KidProfile> profiles = storage.getKidProfilesBySchool(appId, schoolId);
        return new Response<>(profiles);
    }

    @CrossOrigin
    @RequestMapping(method = RequestMethod.POST, value = "/consoleweb/{appId}/{schoolId}/kid")
    public @ResponseBody Response<KidProfile> saveKidProfile(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody KidProfile kid) {
        kid.setAppId(appId);
        kid.setSchoolId(schoolId);
        List<KidProfile> kidProfiles = storage.getKidProfilesBySchool(appId, schoolId);
        KidProfile selectedKidProfile = storage.getKidProfile(appId, schoolId, kid.getKidId());
        if (selectedKidProfile == null) {
            kidProfiles.add(kid);
        } else {
            int profileIndex = kidProfiles.indexOf(selectedKidProfile);
            kidProfiles.remove(profileIndex);
            kidProfiles.add(profileIndex, kid);
        }

        storage.updateChildren(appId, schoolId, kidProfiles);
        kidManager.updateParents(kid);
        return new Response<>(kid);
    }


    @RequestMapping(method = RequestMethod.GET,
            value = "/consoleweb/{appId}/{schoolId}/group/{groupId}")
    public @ResponseBody Response<GroupDTO> readGroupInfo(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String groupId) {

        GroupDTO group = storage.getGroupData(appId, schoolId, groupId);
        if (group != null) {
            return new Response<>(group);
        } else {
            logger.error("section {} is null or it has more than one result", groupId);
            return new Response<>("section is null or found more than one result");
        }

    }

    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/{schoolId}/group")
    public @ResponseBody Response<List<GroupDTO>> readGroupsInfo(@PathVariable String appId,
            @PathVariable String schoolId) {
        return new Response<List<GroupDTO>>(storage.getGroupsDataBySchool(appId, schoolId));
    }


    @RequestMapping(method = RequestMethod.PUT,
            value = "/consoleweb/{appId}/{schoolId}/teacher/{teacherId}/section/{sectionId}")
    public @ResponseBody Response<Teacher> addTeacherToSection(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String teacherId,
            @PathVariable String sectionId) {
        return new Response<>(
                teacherManager.addToSectionOrGroup(appId, schoolId, teacherId, sectionId));
    }

    @RequestMapping(method = RequestMethod.DELETE,
            value = "/consoleweb/{appId}/{schoolId}/teacher/{teacherId}/section/{sectionId}")
    public @ResponseBody Response<Teacher> removeTeacherFromSection(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String teacherId,
            @PathVariable String sectionId) {
        return new Response<>(
                teacherManager.removeFromSectionOrGroup(appId, schoolId, teacherId, sectionId));
    }


    @RequestMapping(method = RequestMethod.PUT,
            value = "/consoleweb/{appId}/{schoolId}/kid/{kidId}/group")
    public @ResponseBody Response<KidProfile> addToGroup(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId,
            @RequestBody SectionDef group) {
        return new Response<>(kidManager.addToGroup(appId, schoolId, kidId, group));
    }


    @RequestMapping(method = RequestMethod.DELETE,
            value = "/consoleweb/{appId}/{schoolId}/kid/{kidId}/group/{groupId}")
    public @ResponseBody Response<KidProfile> deleteFromGroup(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId,
            @PathVariable String groupId) {
        return new Response<>(kidManager.removeFromGroup(appId, schoolId, kidId, groupId));
    }

    @RequestMapping(method = RequestMethod.DELETE,
            value = "/consoleweb/{appId}/{schoolId}/kid/{kidId}/section/{sectionId}")
    public @ResponseBody Response<KidProfile> deleteFromSection(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId,
            @PathVariable String sectionId) {
        return new Response<>(kidManager.removeFromSection(appId, schoolId, kidId, sectionId));
    }

    @RequestMapping(method = RequestMethod.PUT,
            value = "/consoleweb/{appId}/{schoolId}/kid/{kidId}/section")
    public @ResponseBody Response<KidProfile> addToSection(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId,
            @RequestBody SectionDef group) {
        return new Response<>(kidManager.putInSection(appId, schoolId, kidId, group));
    }

    @CrossOrigin
    @RequestMapping(method = RequestMethod.DELETE,
            value = "/consoleweb/{appId}/{schoolId}/kid/{kidId}")
    public Response<KidProfile> removeKidProfile(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId) {
        List<KidProfile> kidProfiles = storage.getKidProfilesBySchool(appId, schoolId);
        KidProfile kidToRemove = storage.getKidProfile(appId, schoolId, kidId);
        kidProfiles.remove(kidToRemove);
        storage.updateChildren(appId, schoolId, kidProfiles);
        return new Response<>(kidToRemove);
    }

    @CrossOrigin
    @RequestMapping(method = RequestMethod.POST, value = "/consoleweb/{appId}/{schoolId}/teacher")
    public Response<Teacher> saveTeacherProfile(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody Teacher teacher) {
        teacher.setAppId(appId);
        teacher.setSchoolId(schoolId);
        List<Teacher> teacherProfiles = storage.getTeachers(appId, schoolId);
        Teacher selectedTeacherProfile =
                storage.getTeacherByTeacherId(teacher.getTeacherId(), appId, schoolId);
        if (selectedTeacherProfile == null) {
            teacherProfiles.add(teacher);
        } else {
            int profileIndex = teacherProfiles.indexOf(selectedTeacherProfile);
            teacherProfiles.add(profileIndex, teacher);
            teacherProfiles.remove(profileIndex + 1);
        }
        storage.updateTeachers(appId, schoolId, teacherProfiles);
        return new Response<>(teacher);
    }

    @CrossOrigin
    @RequestMapping(method = RequestMethod.DELETE,
            value = "/consoleweb/{appId}/{schoolId}/teacher/{teacherId}")
    public Response<Teacher> removeTeacherProfile(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String teacherId) {
        List<Teacher> teacherProfiles = storage.getTeachers(appId, schoolId);
        Teacher teacherToRemove = storage.getTeacherByTeacherId(teacherId, appId, schoolId);
        teacherProfiles.remove(teacherToRemove);
        storage.updateTeachers(appId, schoolId, teacherProfiles);
        return new Response<>(teacherToRemove);
    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/consoleweb/{appId}/{schoolId}/kid/{kidId}/picture")
    public Response<Void> updloadKidPicture(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId,
            @RequestParam("image") MultipartFile picture, HttpServletResponse response) {

        if (picture == null) {
            logger.error("No multipart file on field 'image'");
            return new Response<>("The multipart file is attended on field named image");
        }
        String pictureFileName;
        try {
            pictureFileName = kidManager.saveKidPicture(kidId, picture);
        } catch (IOException e) {
            logger.error("Exception saving kid picture", e);
            return new Response<>("Internal error saving picture");
        }
        logger.info("Updloaded picture for kid {}", kidId);
        KidProfile kid = kidManager.getKidProfile(appId, schoolId, kidId);
        if (kid != null) {
            kid.setImage(pictureFileName);
            kidManager.updateKid(kid);
            logger.info("Update profile of kid {} with image {}", kidId, pictureFileName);
        }
        return new Response<>();
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/consoleweb/{appId}/{schoolId}/kid/{kidId}/picture")
    public @ResponseBody HttpEntity<byte[]> downloadKidPicture(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(0);

        String path = kidManager.getKidPicturePath(appId, schoolId, kidId);
        FileInputStream in = null;
        try {
            in = new FileInputStream(new File(path));
        } catch (FileNotFoundException | NullPointerException e) {
            path = kidManager.getDefaultKidPicturePath();
            in = new FileInputStream(new File(path));
        }
        byte[] image = IOUtils.toByteArray(in);
        headers.setContentLength(image.length);
        String extension = path.substring(path.lastIndexOf("."));
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



}
