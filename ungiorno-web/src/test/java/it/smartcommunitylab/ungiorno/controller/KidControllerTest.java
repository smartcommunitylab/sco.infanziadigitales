package it.smartcommunitylab.ungiorno.controller;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import javax.annotation.PostConstruct;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.AnnotationConfigWebContextLoader;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.test.WebTestConfig;


@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {WebTestConfig.class},
        loader = AnnotationConfigWebContextLoader.class)
@WebAppConfiguration
public class KidControllerTest {

    @Autowired
    private WebApplicationContext wac;

    private MockMvc mockMvc;

    @Autowired
    private MongoTemplate mongo;

    @PostConstruct
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(this.wac).build();
    }

    @Test
    public void getKidProfile() throws Exception {
        final String KID_ID = "pinocchio";
        final String APP_ID = "testApp";
        final String SCHOOL_ID = "mySchool";

        KidProfile kid = new KidProfile();
        kid.setKidId(KID_ID);
        kid.setSchoolId(SCHOOL_ID);
        kid.setAppId(APP_ID);

        mongo.save(kid);

        ResultActions callResult = mockMvc.perform(
                get("/student/{appId}/{schoolId}/{kidId}/profile", APP_ID, SCHOOL_ID, KID_ID));

        callResult.andExpect(status().isOk()).andExpect(jsonPath("$.data.schoolId", is(SCHOOL_ID)))
                .andExpect(jsonPath("$.data.partecipateToSperimentation").doesNotExist());

    }

}
