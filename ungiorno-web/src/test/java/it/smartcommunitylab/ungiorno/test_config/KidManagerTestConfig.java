package it.smartcommunitylab.ungiorno.test_config;

import java.net.UnknownHostException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.MongoClient;
import com.mongodb.MongoException;

import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.services.impl.KidManager;


// @Configuration
@PropertySource("classpath:app.properties")
public class KidManagerTestConfig {
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
    public KidManager kidManager() {
        return new KidManager();
    }

    @Bean
    public RepositoryService repoManager() {
        return new FakeRepoManager();
    }


}
