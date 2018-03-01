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
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.FileImageOutputStream;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.Metadata;
import com.drew.metadata.MetadataException;
import com.drew.metadata.exif.ExifIFD0Directory;

/**
 * @author raman
 *
 */
public class ImageUtils {

	private static final int MAX_DIMENSION = 200; // for width/height
	
    public static void compressImage(BufferedImage bi, String name) throws IOException {
    	Path source = Paths.get(name);
    	if (Files.exists(Paths.get(name+"_old"))) Files.delete(Paths.get(name+"_old"));
		Files.move(source, source.resolveSibling(source.getFileName()+"_old"));
    	try {
//          rescale(bi, f);
            compress(bi, new File(name));
        	Files.delete(Paths.get(name+"_old"));
    	}catch (IOException e) {
    		if (Files.exists(source)) Files.delete(source);
    		Files.move(source.resolveSibling(source.getFileName()+"_old"), source);
    		throw e;
    	}	

    	
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


    public static void rescale(BufferedImage bi, File f) throws IOException {
        // rescale to MAXxMAX
    	int originalWidth = bi.getWidth();
        int originalHeight = bi.getHeight();
        int type = bi.getType() == 0 ? BufferedImage.TYPE_INT_ARGB : bi.getType();

        if (originalHeight > originalWidth) {
        	double prop = 1.0 * originalHeight / originalWidth;
        	originalHeight = Math.min(originalHeight, MAX_DIMENSION);
        	originalWidth = (int)(1.0 * originalHeight / prop);
        } else {
        	double prop = 1.0 * originalWidth / originalHeight;
        	originalWidth = Math.min(originalWidth, MAX_DIMENSION);
        	originalHeight = (int)(1.0 * originalWidth / prop);
        }
        
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
    
    /**
     * Align (check rotation) and scale down to 100x100 the image passed as input stream.
     * @param is
     * @param f
     * @throws ImageProcessingException
     * @throws IOException
     * @throws MetadataException
     */
    public static void alignImage(InputStream is, File f) throws ImageProcessingException, IOException, MetadataException {
    	BufferedImage originalImage = ImageIO.read(is);
    	rescale(originalImage, f);
    	
    	Metadata metadata = ImageMetadataReader.readMetadata(f);
    	ExifIFD0Directory exifIFD0Directory = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);

        int orientation = 1;
        try {
            orientation = exifIFD0Directory.getInt(ExifIFD0Directory.TAG_ORIENTATION);
        } catch (Exception ex) {
            //ex.printStackTrace();
        }
        
        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        AffineTransform affineTransform = new AffineTransform();

        switch (orientation) {
        case 1:
            break;
        case 2: // Flip X
            affineTransform.scale(-1.0, 1.0);
            affineTransform.translate(-width, 0);
            break;
        case 3: // PI rotation
            affineTransform.translate(width, height);
            affineTransform.rotate(Math.PI);
            break;
        case 4: // Flip Y
            affineTransform.scale(1.0, -1.0);
            affineTransform.translate(0, -height);
            break;
        case 5: // - PI/2 and Flip X
            affineTransform.rotate(-Math.PI / 2);
            affineTransform.scale(-1.0, 1.0);
            break;
        case 6: // -PI/2 and -width
            affineTransform.translate(height, 0);
            affineTransform.rotate(Math.PI / 2);
            break;
        case 7: // PI/2 and Flip
            affineTransform.scale(-1.0, 1.0);
            affineTransform.translate(-height, 0);
            affineTransform.translate(0, width);
            affineTransform.rotate(3 * Math.PI / 2);
            break;
        case 8: // PI / 2
            affineTransform.translate(0, width);
            affineTransform.rotate(3 * Math.PI / 2);
            break;
        default:
            break;
        }       

        if (orientation > 1 && orientation <= 8) {
            AffineTransformOp affineTransformOp = new AffineTransformOp(affineTransform, AffineTransformOp.TYPE_BILINEAR);
            BufferedImage destinationImage = new BufferedImage(originalImage.getHeight(), originalImage.getWidth(), originalImage.getType());
            destinationImage = affineTransformOp.filter(originalImage, destinationImage);
            ImageIO.write(destinationImage, "jpg", f);
        }
    }
    
//    public static void main(String[] args) throws FileNotFoundException, IOException {
//    	String name = "out.jpeg";
//    	compressImage(ImageIO.read(new FileInputStream("small.jpeg")), name);
//    }
    
}
