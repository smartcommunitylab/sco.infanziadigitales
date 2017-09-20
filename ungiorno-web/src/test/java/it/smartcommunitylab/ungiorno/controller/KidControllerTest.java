package it.smartcommunitylab.ungiorno.controller;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.annotation.PostConstruct;

import org.junit.Before;
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

    @Before
    public void clean() {
        mongo.getDb().dropDatabase();
    }

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
        kid.setPartecipateToSperimentation(true);

        mongo.save(kid);

        ResultActions callResult = mockMvc.perform(
                get("/student/{appId}/{schoolId}/{kidId}/profile", APP_ID, SCHOOL_ID, KID_ID));


        Map<String, Object> expectedKid = new HashMap<>();
        expectedKid.put("kidId", KID_ID);
        expectedKid.put("schoolId", SCHOOL_ID);
        expectedKid.put("appId", APP_ID);
        expectedKid.put("partecipateToSperimentation", true);
        expectedKid.put("firstName", null);
        callResult.andExpect(status().isOk());
        constructAssertionFromMap(callResult, expectedKid);
    }


    private ResultActions constructAssertionFromMap(ResultActions resultActions,
            Map<String, Object> expectedJsonFields) throws Exception {
        for (Entry<String, Object> mapEntry : expectedJsonFields.entrySet()) {
            resultActions.andExpect(jsonPath(String.format("$.data.%s", mapEntry.getKey()),
                    is(mapEntry.getValue())));
        }
        return resultActions;
    }

}
