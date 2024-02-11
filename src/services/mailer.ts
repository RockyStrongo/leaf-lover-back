//importing modules
import { createTransport } from 'nodemailer'


//function to send email to the user
const sendingMail = async({from, to, subject, text}:
    { from: string; to: string; subject:string; text: string; }
    ) => {

    try {
        let mailOptions = ({
        from,
        to,
        subject,
        text
    })
    //asign createTransport method in nodemailer to a variable
    //service: to determine which email platform to use
    //auth contains the senders email and password which are all saved in the .env
    const Transporter = createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        });

        //return the Transporter variable which has the sendMail method to send the mail
        //which is within the mailOptions
        return await Transporter.sendMail(mailOptions) 
    } catch (error) {
        console.log(error)
    }
    
}
export default sendingMail;