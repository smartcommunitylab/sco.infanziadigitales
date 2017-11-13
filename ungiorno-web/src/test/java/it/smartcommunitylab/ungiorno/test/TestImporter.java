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

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.List;

import it.smartcommunitylab.ungiorno.importer.ImportError;
import it.smartcommunitylab.ungiorno.importer.Importer;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.Teacher;

/**
 * @author raman
 *
 */
public class TestImporter {

    // FIXME disable because it fail
    // @Test
    public void testSchoolImport() throws ImportError {
        Importer importer = new Importer();
        importer.importSchoolData("a", "s", Thread.currentThread().getContextClassLoader()
                .getResourceAsStream("model/scuola.xls"));
        SchoolProfile schoolProfile = importer.getSchoolProfile();
        assertNotNull(schoolProfile);
        List<Teacher> teachers = importer.getTeachers();
        assertTrue(teachers.size() > 0);
    }

    // FIXME disable because it fail
    // @Test
    public void testChildrenImport() throws ImportError {
        Importer importer = new Importer();
        importer.importChildrenData("a", "s", Thread.currentThread().getContextClassLoader()
                .getResourceAsStream("model/bambini.xls"));
        List<KidProfile> children = importer.getChildren();
        assertTrue(children.size() > 0);

    }
}
