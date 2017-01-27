/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 * 
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 * 
 *        http://www.apache.org/licenses/LICENSE-2.0
 * 
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.test;

import it.smartcommunitylab.ungiorno.usage.UsageEntity;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageActor;
import it.smartcommunitylab.ungiorno.usage.UsageManager;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

/**
 * @author raman
 *
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=TestConfig.class, loader=AnnotationConfigContextLoader.class)
public class TestUsage {

	@Autowired
	private UsageManager usageManager;	
	
	@Autowired
	private MongoTemplate template;	
	
	private static final String APP_ID = "test";
	private static final String SCHOOL_ID = "test";
	
	@Before
	public void init() {
		template.dropCollection(UsageEntity.class);
	}
	
	@Test
	public void test() throws Exception {
		usageManager.messageSent(APP_ID, SCHOOL_ID, "1", "2", UsageActor.TEACHER, UsageActor.PARENT, false);
		usageManager.messageSent(APP_ID, SCHOOL_ID, "2", "1", UsageActor.PARENT, UsageActor.TEACHER, false);
		usageManager.messageSent(APP_ID, SCHOOL_ID, "3", "1", UsageActor.PARENT, UsageActor.TEACHER, false);
		usageManager.messageSent(APP_ID, SCHOOL_ID, "2", "1", UsageActor.PARENT, UsageActor.TEACHER, false);
		usageManager.messageSent(APP_ID, SCHOOL_ID, "1" , null, UsageActor.TEACHER, UsageActor.PARENT, true);
		usageManager.kidAbsence(APP_ID, SCHOOL_ID, "2");
		usageManager.kidAbsence(APP_ID, SCHOOL_ID, "3");
		usageManager.kidReturn(APP_ID, SCHOOL_ID, "2", false);
		usageManager.kidReturn(APP_ID, SCHOOL_ID, "4", true);
		
		System.err.println(usageManager.generateCSV(APP_ID, SCHOOL_ID));
		
	}

}
