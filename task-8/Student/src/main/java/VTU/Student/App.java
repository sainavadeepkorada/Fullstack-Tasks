 package VTU.Student;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args )
    {
    	AnnotationConfigApplicationContext container=new AnnotationConfigApplicationContext(Config.class);
        
    	StudentService service=container.getBean(StudentService.class);
    	
    	service.displayBook();
    	
    	container.close();
    }
}
