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
package it.smartcommunitylab.ungiorno.utils;

import java.awt.AlphaComposite;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Iterator;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.FileImageOutputStream;

/**
 * @author raman
 *
 */
public class ImageUtils {

    public static void compressImage(BufferedImage bi, File f) throws IOException {
//         rescale(bi, f);
        compress(bi, f);
    }
//
//
//    public static void store(InputStream in, OutputStream out) throws IOException {
//        byte[] buffer = new byte[1024];
//        int c = 0;
//        while ((c = in.read(buffer)) != -1) {
//            out.write(buffer, 0, c);
//        }
//        out.flush();
//        out.close();
//    }


    private static void rescale(BufferedImage bi, File f) throws IOException {
        int originalWidth = bi.getWidth();
        int originalHeight = bi.getHeight();
        int type = bi.getType() == 0 ? BufferedImage.TYPE_INT_ARGB : bi.getType();

        if (originalHeight > originalWidth) {
        	double prop = 1.0 * originalHeight / originalWidth;
        	originalHeight = Math.min(originalHeight, 100);
        	originalWidth = (int)(1.0 * originalHeight / prop);
        } else {
        	double prop = 1.0 * originalWidth / originalHeight;
        	originalWidth = Math.min(originalWidth, 100);
        	originalHeight = (int)(1.0 * originalWidth / prop);
        }
        
        // rescale 50%
        BufferedImage resizedImage = new BufferedImage(originalWidth, originalHeight, type);
        Graphics2D g = resizedImage.createGraphics();
        g.drawImage(bi, 0, 0, originalWidth, originalHeight, null);
        g.dispose();
        g.setComposite(AlphaComposite.Src);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        ImageIO.write(resizedImage, "jpg", f);
    }

    private static void compress(BufferedImage bi, File f)
            throws FileNotFoundException, IOException {
        Iterator<ImageWriter> i = ImageIO.getImageWritersByFormatName("jpeg");
        ImageWriter jpegWriter = i.next();

        // Set the compression quality
        ImageWriteParam param = jpegWriter.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(0.5f);

        // Write the image to a file
        FileImageOutputStream out = new FileImageOutputStream(f);
        jpegWriter.setOutput(out);
        jpegWriter.write(null, new IIOImage(bi, null, null), param);
        jpegWriter.dispose();
        out.close();
    }
}
