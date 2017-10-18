package it.smartcommunitylab.ungiorno.services.impl;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import it.smartcommunitylab.ungiorno.config.AppConfig;
import it.smartcommunitylab.ungiorno.model.Teacher;


public class EmailManagerTest {

    public static void main(String[] a) {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
        ctx.register(AppConfig.class);
        ctx.refresh();
        TemplateMailManager templateMailManager =
                ctx.getBean("templateMailManager", TemplateMailManager.class);

        Teacher teacher = new Teacher();
        teacher.setTeacherName("Betty");
        teacher.setTeacherSurname("Brant");
        teacher.setTeacherFullname("Betty Brant");
        Map<String, Object> params = new HashMap<>();
        params.put("teacher", teacher);
        System.out.println(
                templateMailManager.generate(params, "emailTemplates/pin-comunication.html"));
    }

}

