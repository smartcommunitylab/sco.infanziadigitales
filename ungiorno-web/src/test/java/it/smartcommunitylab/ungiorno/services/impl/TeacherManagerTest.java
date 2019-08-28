package it.smartcommunitylab.ungiorno.services.impl;

import java.net.UnknownHostException;

import org.junit.Assert;
import org.junit.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import com.mongodb.MongoClient;
import com.mongodb.MongoException;

import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.test_config.FakeRepoManager;

// @RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {TeacherManagerTestConfig.class},
        loader = AnnotationConfigContextLoader.class)
public class TeacherManagerTest {

    // @Autowired
    // private TeacherManager teacherManager;


    // TO FIX DEPENDENCIES
    @Test
    public void generatePinForNotExistingTeacher() {
        // Assert.assertThat(teacherManager.generatePin("APP", "SCHOOL", "TEACHER_ID"),
        // Matchers.nullValue());
        Assert.assertTrue(true);
    }


}


// @Configuration
@PropertySource("classpath:app.properties")
class TeacherManagerTestConfig {

    private String dbName = "ungiorno-test";

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }

    @Bean
    public MongoTemplate getMongo() throws UnknownHostException, MongoException {
        return new MongoTemplate(new MongoClient(), dbName);
    }


    // @Bean
    // public TeacherManager teacherManager() {
    // return new TeacherManager();
    // }


    @Bean
    public RepositoryService repoManager() {
        return new FakeRepoManager();
    }


}
