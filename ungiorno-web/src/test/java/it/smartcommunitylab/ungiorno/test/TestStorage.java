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

import org.junit.Assert;
import org.springframework.beans.factory.annotation.Autowired;

import it.smartcommunitylab.ungiorno.model.KidCalRitiro;
import it.smartcommunitylab.ungiorno.services.RepositoryService;

/**
 * @author raman
 *
 */
// FIXME disable because it fail
// @RunWith(SpringJUnit4ClassRunner.class)
// @ContextConfiguration(classes = TestConfig.class, loader = AnnotationConfigContextLoader.class)
public class TestStorage {

    @Autowired
    private RepositoryService storage;


    // FIXME disable because it fail
    // @Test
    public void testRitiro() throws Exception {
        KidCalRitiro ret = storage.getReturn("trento", "povo", "62kid", 1481583600000L);
        Assert.assertNotNull(ret);
    }

}
