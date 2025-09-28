import React, { useEffect, useState } from 'react'
import { Pie, Bar } from 'react-chartjs-2'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios'
import swal from 'sweetalert'
import { FaDownload } from "react-icons/fa";
import './Results.css'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
  Title
} from 'chart.js'
import { Link } from 'react-router-dom'
import unavailable from '../Assests/unavailable.png'
import { useTheme } from '../../Context/ThemeContext'
const BASE_URL = process.env.REACT_APP_BASE_URL;

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
  Title
)

const Results = () => {
  const [elections, setElections] = useState([])
  const [selectedElectionId, setSelectedElectionId] = useState('')
  const [electionDetails, setElectionDetails] = useState(null)
  const [isBlurred, setIsBlurred] = useState(false)
  const { theme } = useTheme()

  const navigate = useNavigate()

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/elections`)
        setElections(response.data.data)
      } catch (error) {
        console.error('Error fetching elections:', error)
      }
    }

    fetchElections()
  }, [])

  useEffect(() => {
    if (selectedElectionId) {
      const fetchElectionDetails = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/v1/results/general/${selectedElectionId}`)
          console.log('API Response:', response.data.data)

          // Transform or validate the data if necessary
          setElectionDetails(response.data.data || null)
        } catch (error) {
          console.error('Error fetching election details:', error)
        }
      }

      fetchElectionDetails()
    }
  }, [selectedElectionId])

  useEffect(() => {
    if (electionDetails) {
      console.log('Updated Election Details:', electionDetails)
    }
  }, [electionDetails])

  const handleElectionChange = event => {
    const selectedId = event.target.value
    setSelectedElectionId(selectedId)

    // Find the selected election
    const selectedElection = elections.find(
      election => election._id === selectedId
    )

    if (selectedElection) {
      const status = getElectionStatus(
        selectedElection.startTime,
        selectedElection.endTime
      )

      if (status === 'Upcoming') {
        setIsBlurred(true) // Activate blur effect
        swal('Warning', 'The Election is still not Started', 'warning').then(
          () => {
            navigate('/') // Use the navigate hook here
          }
        )
        return // Stop further execution
      }

      if (status === 'Ongoing') {
        swal(
          'Notice',
          'The Election is Ongoing, Please Check the result after it finishes',
          'info'
        ).then(() => {
          navigate('/') // Use the navigate hook here
        })
        return // Stop further execution
      }

      // Proceed to fetch and display election details if it's "Finished"
      setSelectedElectionId(selectedId)
    }
  }
  // Calculate total votes
  const calculateTotalVotes = () => {
    if (!electionDetails || !electionDetails.results?.voteDistribution) return 0
    return electionDetails.results.voteDistribution.reduce(
      (total, item) => total + item.votes,
      0
    )
  }

  // Find the winner
  const findWinner = () => {
    if (!electionDetails || !electionDetails.results?.voteDistribution)
      return null;

    const sortedCandidates = [...electionDetails.results.voteDistribution].sort(
      (a, b) => b.votes - a.votes
    );

    const highestVotes = sortedCandidates[0]?.votes;

    const winners = sortedCandidates.filter(candidate => candidate.votes === highestVotes);

    if (winners.length > 1) {
      return `${winners.length} Winners`;
    }

    const winner = winners[0]?.candidateId?.user;
    return winner ? `${winner.firstName} ${winner.lastName}` : 'Unknown';
  };

  // Find the winning party
  const findWinningParty = () => {
    if (!electionDetails || !electionDetails.results?.voteDistribution)
      return 'No party declared'

    const partyVotes = {}
    electionDetails.results.voteDistribution.forEach(item => {
      const party = item.candidateId?.party?.name || 'Unknown Party'
      partyVotes[party] = (partyVotes[party] || 0) + item.votes
    })

    const sortedParties = Object.entries(partyVotes).sort((a, b) => b[1] - a[1])
    return sortedParties[0]?.[0] || 'No party declared'
  }
  const COLORS = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40'
  ]

  const voteDistribution = electionDetails?.results.voteDistribution || [] // Ensure it's an array
  const pieChartData = {
    labels: voteDistribution.map(
      item => item.candidateId?.user?.firstName || 'Unknown'
    ),
    datasets: [
      {
        data: voteDistribution.map(item => item.votes),
        backgroundColor: COLORS
      }
    ]
  }

  const barChartData = {
    labels: voteDistribution.map(
      item => item.candidateId?.user.firstName || 'Unknown'
    ),
    datasets: [
      {
        label: 'Votes',
        data: voteDistribution.map(item => item.votes),
        backgroundColor: COLORS
      }
    ]
  }


  const getElectionStatus = (startTime, endTime) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) return 'Upcoming'
    if (now >= start && now <= end) return 'Ongoing'
    return 'Finished'
  }

  const downloadResultsPDF = () => {
    swal({
      title: "Are you sure?",
      text: "Do you want to download the results as a PDF?",
      icon: "warning",
      buttons: ["Cancel", "Yes"],
      dangerMode: true,
    }).then((willDownload) => {
      if (willDownload) {
        const resultsDiv = document.getElementById('resultsSection'); // The container with results

        if (!resultsDiv) {
          console.error('Results container not found');
          return;
        }

        html2canvas(resultsDiv, { scale: 2 }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');

          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save('Election_Results.pdf');
        });
      }
    });
  };

  return (
    <div
      className={
        isBlurred ? `blur-background ${theme}` : `results-container ${theme}`
      }
      id='resultsSection'
    >
      <h1 className={`resultsh1 ${theme}`}>Election Results</h1>
      <div className={`form-container ${theme}`}>
        {elections.length > 0 && (
          <div className={`dropdown-container ${theme}`}>
            <label htmlFor='election'>Select an Election</label>
            <select
              id='election'
              value={selectedElectionId}
              onChange={handleElectionChange}
            >
              <option value=''>Select an Election</option>
              {elections.map(election => {
                const status = getElectionStatus(
                  election.startTime,
                  election.endTime
                )
                return (
                  <option key={election._id} value={election._id}>
                    {`${election.name} - ${status}`}
                  </option>
                )
              })}
            </select>
          </div>
        )}
      </div>
      {electionDetails && (
        <div className={`results-details ${theme}`}>
          <h2 className={`election-title ${theme}`}>{electionDetails.name}</h2>
          <p className={`election-description ${theme}`}>
            {electionDetails.description}
          </p>

          <div className={`results-summary ${theme}`}>
            <div className={`summary-item ${theme}`}>
              <h3 className={`resultsh3 ${theme}`}>Total Votes</h3>
              <p>{calculateTotalVotes()}</p>
            </div>
            <div className={`summary-item smry-itm-win ${theme}`}>
              <h3 className={`resultsh3 ${theme}`}>Winner</h3>
              <p>{findWinner() || 'No winner yet'}</p>
            </div>
            <div className={`summary-item ${theme}`}>
              <h3 className={`resultsh3 ${theme}`}>Winning Party</h3>
              <p>{findWinningParty() || 'No party declared'}</p>
            </div>
          </div>

          <button
            onClick={downloadResultsPDF}
            className={`download-btn ${theme}`}
            data-tooltip-id="download-tooltip"
            data-tooltip-content="Download Results as PDF"
            title="Download Results as PDF"
          >
            <FaDownload size={24} />
          </button>

          <div className={`charts-container ${theme}`}>
            <h2>Vote Analysis</h2>
            <div className={`charts-grid ${theme}`}>
              {/* Pie Chart */}
              <div className={`chart-card ${theme}`}>
                <h3 className={`resultsh3 ${theme}`}>
                  Vote Distribution (Pie Chart)
                </h3>
                <div className={`chart-content ${theme}`}>
                  <Pie
                    data={pieChartData}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            font: {
                              size: 14
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Bar Chart */}
              <div className={`chart-card ${theme}`}>
                <h3 className={`resultsh3 ${theme}`}>
                  Votes by Candidate (Bar Chart)
                </h3>
                <div className={`chart-content ${theme}`}>
                  <Bar
                    data={barChartData}
                    options={{
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: context => `${context.raw} votes`
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            font: {
                              size: 12
                            }
                          }
                        },
                        y: {
                          ticks: {
                            font: {
                              size: 12
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className={`candidates-section ${theme}`}>
            <h3 className={`resultsh3 ${theme}`}>Candidate Results</h3>
            {voteDistribution.length > 0 ? (
              [...voteDistribution]
                .sort((a, b) => b.votes - a.votes)
                .map((item, index) => (
                  <div key={index} className={`candidate-card ${theme}`}>
                    <img
                      src={
                        item.candidateId?.user?.profilePhoto
                          ? (item.candidateId.user.profilePhoto)
                          : unavailable
                      }
                      alt={item.candidateId?.user?.firstName || 'Unknown'}
                      className='candidatePhoto'
                    />
                    <div className={`candidate-info ${theme}`}>
                      <h4>
                        {item.candidateId?.user?.firstName || 'Unknown Candidate'}{' '}
                        {item.candidateId?.user?.lastName}
                      </h4>
                      <p>Votes: {item.votes}</p>
                      {item.candidateId?.user ? (
                        <Link
                          to={`/candidate/${item.candidateId.user._id}`}
                          className='candidate-link'
                        >
                          View Candidate Details
                        </Link>
                      ) : (
                        <span className='unavailable-msg'>Candidate Unavailable</span>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <p>No candidates found.</p>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

export default Results
