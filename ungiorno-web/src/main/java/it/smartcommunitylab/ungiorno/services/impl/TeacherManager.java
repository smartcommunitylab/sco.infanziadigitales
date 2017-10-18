package it.smartcommunitylab.ungiorno.services.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.mail.MessagingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.utils.RandomString;

@Service
public class TeacherManager {

    private static final Logger logger = LoggerFactory.getLogger(TeacherManager.class);
    @Autowired
    private RepositoryService repoManager;

    private static RandomString pinGenerator = new RandomString(6);

    @Value("${email.address.from}")
    private String defaultFromEmailAddress;

    @Autowired
    private EmailManager emailManager;

    public Teacher addToSectionOrGroup(String appId, String schoolId, String teacherId,
            String sectionId) {
        Teacher teacher = repoManager.getTeacherByTeacherId(teacherId, appId, schoolId);
        if (teacher != null) {
            if (teacher.getSectionIds() == null) {
                teacher.setSectionIds(new ArrayList<String>());
            }
            if (!teacher.getSectionIds().contains(sectionId)) {
                teacher.getSectionIds().add(sectionId);
            }

            teacher = repoManager.saveOrUpdateTeacher(appId, schoolId, teacher);

        }
        return teacher;
    }

    public Teacher removeFromSectionOrGroup(String appId, String schoolId, String teacherId,
            String sectionId) {
        Teacher teacher = repoManager.getTeacherByTeacherId(teacherId, appId, schoolId);
        if (teacher != null) {
            if (teacher.getSectionIds() != null) {
                teacher.getSectionIds().remove(sectionId);
                teacher = repoManager.saveOrUpdateTeacher(appId, schoolId, teacher);
            }
        }
        return teacher;
    }


    public Teacher generatePin(String appId, String schoolId, String teacherId) {
        Teacher teacher = repoManager.getTeacherByTeacherId(teacherId, appId, schoolId);
        if (teacher != null) {
            String pin = generatePin();
            teacher.setPin(pin);
            teacher = repoManager.saveOrUpdateTeacher(appId, schoolId, teacher);
            Map<String, Object> params = new HashMap<>();
            params.put("teacher", teacher);
            try {
                emailManager.sendSimpleMail(defaultFromEmailAddress, teacher.getUsername(),
                        "credenziali di accesso applicazioni genitori UGAS", params,
                        "emailTemplates/pin-comunication.html");
            } catch (MessagingException e) {
                logger.error("Exception sending pin comunication to teacher {}", teacherId, e);
            }
        }

        return teacher;
    }

    private String generatePin() {
        return pinGenerator.nextString();
    }
}
