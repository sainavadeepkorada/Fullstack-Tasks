package VTU.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class StudentService {

	@Autowired
	private Book student;
	
	public void displayBook() {
		System.out.println("Student Details:");
		System.out.println(student);
	}
}
