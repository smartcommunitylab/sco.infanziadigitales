/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
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
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.test;

import java.net.UnknownHostException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import com.mongodb.MongoClient;
import com.mongodb.MongoException;

import eu.trentorise.smartcampus.aac.AACException;
import eu.trentorise.smartcampus.aac.model.TokenData;
import eu.trentorise.smartcampus.profileservice.BasicProfileService;
import eu.trentorise.smartcampus.profileservice.ProfileServiceException;
import eu.trentorise.smartcampus.profileservice.model.AccountProfile;
import eu.trentorise.smartcampus.profileservice.model.BasicProfile;
import it.smartcommunitylab.ungiorno.controller.KidController;
import it.smartcommunitylab.ungiorno.diary.model.DiaryUser;
import it.smartcommunitylab.ungiorno.services.PermissionsService;
import it.smartcommunitylab.ungiorno.utils.NotificationManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;


// @Configuration
// exclusion of NotificationManager because it refers to a permissionsManager instance
@ComponentScan(
        basePackages = {"it.smartcommunitylab.ungiorno.storage",
                "it.smartcommunitylab.ungiorno.usage", "it.smartcommunitylab.ungiorno.utils"},
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,
                        classes = {PermissionsManager.class}),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,
                        classes = {NotificationManager.class})})
@PropertySource("classpath:app.properties")
@EnableWebMvc
public class WebTestConfig {

    private String dbName = "ungiorno-test";

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }

    @Bean
    public MongoTemplate getMongo() throws UnknownHostException, MongoException {
        return new MongoTemplate(new MongoClient(), dbName);
    }


    @Bean
    public KidController getKidController() {
        return new KidController();
    }


    /*
     * Defined a always true permissions class to test controllers without security
     */
    @Bean
    public PermissionsService getPermissions() {
        return new AlwaysYesPermissionsManager();
    }

    private static class AlwaysYesPermissionsManager implements PermissionsService {
        @Override
        public boolean checkKidProfile(String appId, String schoolId, String kidId,
                Boolean isTeacher) {
            return true;
        }

        @Override
        public DiaryUser getDiaryUser(String appId, String schoolId, Boolean isTeacher) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public String getUserId() {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public boolean isSchoolTeacher(String appId, String schoolId, String username) {
            // TODO Auto-generated method stub
            return false;
        }

        @Override
        public boolean hasAccess(DiaryUser du, String kidId, String schoolId) {
            // TODO Auto-generated method stub
            return false;
        }

        @Override
        public String getEmail(AccountProfile account) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public String getUserAccessToken() throws SecurityException, AACException {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public TokenData codeToToken(String code) throws SecurityException, AACException {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public BasicProfileService getProfileService() {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public String getLoginURL(String email, String password) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public String getRegisterURL() {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public String getAuthorizationURL(String authority) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public String getAppToken() throws AACException {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public BasicProfile authenticate(HttpServletRequest request, HttpServletResponse response,
                TokenData tokenData, boolean rememberMe)
                throws SecurityException, ProfileServiceException {
            // TODO Auto-generated method stub
            return null;
        }


    }
}
