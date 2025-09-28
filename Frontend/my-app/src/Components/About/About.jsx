import React from 'react';
import './About.css';
import { useTheme } from '../../Context/ThemeContext';

const About = () => {
  const { theme } = useTheme();
  return (
    <div className={`about-container ${theme}`}>
      <h1 className={`about-title ${theme}`}>About ChainVote</h1>
      <p className={`about-description ${theme}`}>
        ChainVote is a next-generation voting platform designed to empower citizens by making elections more transparent, accessible, and efficient. Our platform leverages cutting-edge technology to ensure the integrity of the electoral process, allowing users to engage with candidates, cast their votes securely, and stay informed about election results in real-time. Whether you're a voter or a candidate, ChainVote provides a seamless and user-friendly experience that enhances civic participation. With a commitment to transparency and security, ChainVote is reshaping the future of elections, making democracy more inclusive for everyone.
      </p>

      <h2 className={`features-title ${theme}`}>Key Features</h2>
      <ul className={`features-list ${theme}`} type='none'>
        <li className={`feature-item ${theme}`}>
          <h3>User Registration</h3>
          <p>
            ChainVote offers a secure and straightforward user registration process, which includes email verification to ensure that only eligible voters can participate. The registration process is designed to be user-friendly, guiding users through each step with clear instructions. By implementing robust verification mechanisms, we ensure that the platform maintains the integrity of the electoral process, allowing only legitimate users to access and utilize the system.
          </p>
        </li>
        <li className={`feature-item ${theme}`}>
          <h3>Candidate Application</h3>
          <p>
            Aspiring candidates can apply and register their candidacy through the platform with ease. The process includes identity verification and qualification checks to ensure that only eligible candidates can participate. Candidates can submit their application, upload necessary documents, and track the status of their application in real-time. This streamlined process reduces the administrative burden and makes it easier for candidates to focus on their campaigns.
          </p>
        </li>
        <li className={`feature-item ${theme}`}>
          <h3>Real-time Election Updates</h3>
          <p>
            ChainVote keeps voters informed with real-time updates on all aspects of the election process. This includes notifications about voting start and end times, candidate announcements, and live election results. By providing real-time information, ChainVote ensures that voters are always in the loop, making it easier for them to participate and stay engaged in the democratic process.
          </p>
        </li>
        <li className={`feature-item ${theme}`}>
          <h3>Complaint Submission</h3>
          <p>
            ChainVote offers a transparent and user-friendly complaint submission system that allows voters to raise concerns about candidates or the election process. Users can submit complaints through a simple form, which is then reviewed by the relevant authorities. This feature ensures that the election process is accountable and that any issues or irregularities are addressed promptly, maintaining the integrity of the election.
          </p>
        </li>
        <li className={`feature-item ${theme}`}>
          <h3>Secure Voting System</h3>
          <p>
            Our secure voting system uses state-of-the-art encryption technologies to ensure that each vote is cast and counted accurately. By leveraging blockchain technology, ChainVote provides a tamper-proof voting system where every vote is securely recorded and cannot be altered. This guarantees the integrity of the election and instills confidence in voters that their votes truly matter.
          </p>
        </li>
        <li className={`feature-item ${theme}`}>
          <h3>Comprehensive Candidate Profiles</h3>
          <p>
            Voters can access detailed profiles of each candidate on ChainVote, which include their policies, past records, and public opinions. This information is presented in a clear and organized manner, allowing voters to make informed decisions based on comprehensive data. By providing in-depth candidate profiles, ChainVote empowers voters to choose the candidate who best represents their values and interests.
          </p>
        </li>
        <li className={`feature-item ${theme}`}>
          <h3>Election Analytics</h3>
          <p>
            ChainVote offers comprehensive election analytics, providing users with detailed insights into voter turnout, demographic participation, and election results. These analytics are presented through intuitive charts and graphs, making it easy for users to understand the data. Whether you're a voter, candidate, or analyst, these insights can help you better understand the dynamics of the election.
          </p>
        </li>
        <li className={`feature-item ${theme}`}>
          <h3>Multi-device Support</h3>
          <p>
            ChainVote is designed to be accessible across all devices, including smartphones, tablets, and desktops. The platform is optimized for different screen sizes, ensuring a seamless experience regardless of the device you're using. This multi-device support allows voters to participate in the election from anywhere, at any time, making the process more convenient and inclusive.
          </p>
        </li>
        <li className={`feature-item ${theme}`}>
          <h3>Data Privacy</h3>
          <p>
            ChainVote prioritizes the privacy of its users by implementing strict data protection measures. We adhere to global data privacy regulations and ensure that all user data is encrypted and securely stored. By maintaining a high standard of data privacy, ChainVote protects users' personal information and builds trust with the electorate, ensuring that their participation in the election is safe and secure.
          </p>
        </li>
        <li className={`feature-item ${theme}`}>
          <h3>24/7 Customer Support</h3>
          <p>
            ChainVote provides 24/7 customer support to assist users with any issues or questions they may have. Our dedicated support team is available around the clock to ensure that users have a smooth and stress-free experience on the platform. Whether you're having trouble with registration, voting, or any other feature, our support team is here to help, providing prompt and effective solutions to any problem you may encounter.
          </p>
        </li>
      </ul>

    </div>
  );
};

export default About;