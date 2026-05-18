import React, {
  useEffect,
  useState
} from 'react';

import {
  useParams,
  Link,
  useNavigate
} from 'react-router-dom';

import {
  MessageCircle,
  Building2,
  MapPin,
  UserCircle,
  Briefcase
} from 'lucide-react';

import {
  Avatar
} from '../../components/ui/Avatar';

import {
  Button
} from '../../components/ui/Button';

import {
  Card,
  CardBody,
  CardHeader
} from '../../components/ui/Card';

import {
  Badge
} from '../../components/ui/Badge';

import {
  useAuth
} from '../../context/AuthContext';

import {
  Investor
} from '../../types';

import api from '../../lib/api';

export const InvestorProfile: React.FC =
  () => {

    const { id } = useParams<{
      id: string;
    }>();

    const navigate = useNavigate();

    const {
      user: currentUser,
    } = useAuth();

    const [investor, setInvestor] =
      useState<Investor | null>(
        null
      );

    const [loading, setLoading] =
      useState(true);

    // ─────────────────────────────
    // FETCH INVESTOR
    // ─────────────────────────────
    useEffect(() => {

      const fetchInvestor =
        async () => {

          try {

            const response =
              await api.get(
                `/users/${id}`
              );

            setInvestor(
              response.data.user
            );

          } catch (error) {

            console.error(
              'Error fetching investor:',
              error
            );

          } finally {
            setLoading(false);
          }
        };

      if (id) {
        fetchInvestor();
      }

    }, [id]);

    // ─────────────────────────────
    // LOADING
    // ─────────────────────────────
    if (loading) {

      return (
        <div className="text-center py-10">
          Loading...
        </div>
      );
    }

    // ─────────────────────────────
    // NOT FOUND
    // ─────────────────────────────
    if (
      !investor ||
      investor.role !==
        'investor'
    ) {

      return (
        <div className="text-center py-12">

          <h2 className="text-2xl font-bold text-gray-900">
            Investor not found
          </h2>

          <p className="text-gray-600 mt-2">
            The investor profile
            you're looking for
            doesn't exist.
          </p>

          <Link to="/dashboard/entrepreneur">

            <Button
              variant="outline"
              className="mt-4"
            >
              Back to Dashboard
            </Button>

          </Link>

        </div>
      );
    }

    const isCurrentUser =
      currentUser?._id ===
      investor._id;

      console.log(
        'Investor Data:',
        investor
      );

    return (
      <div className="space-y-6 animate-fade-in">

        {/* PROFILE HEADER */}
        <Card>

          <CardBody className="sm:flex sm:items-start sm:justify-between p-6">

            <div className="sm:flex sm:space-x-6">

              <Avatar
                src={
                  investor.profilePic ||
                  investor.avatarUrl ||
                  ''
                }
                alt={investor.name}
                size="xl"
                status={
                  investor.isOnline
                    ? 'online'
                    : 'offline'
                }
                className="mx-auto sm:mx-0"
              />

              <div className="mt-4 sm:mt-0 text-center sm:text-left">

                <h1 className="text-2xl font-bold text-gray-900">
                  {investor.name}
                </h1>

                {/* DYNAMIC */}
                <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">

                  <Building2
                    size={16}
                    className="mr-1"
                  />

                  Investor •{' '}

                  {investor.totalInvestments || 0}{' '}
                  portfolio companies

                </p>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">

                  {/* LOCATION */}
                  {investor.location && (
                    <Badge variant="primary">

                      <MapPin
                        size={14}
                        className="mr-1"
                      />

                      {
                        investor.location
                      }

                    </Badge>
                  )}

                  {/* STAGES */}
                  {investor.investmentStage?.map(
                    (
                      stage,
                      index
                    ) => (

                      <Badge
                        key={index}
                        variant="secondary"
                        size="sm"
                      >
                        {stage}
                      </Badge>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* ACTIONS */}
            <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">

              {!isCurrentUser && (

                <Link
                  to={`/chat/${investor._id}`}
                >

                  <Button
                    leftIcon={
                      <MessageCircle
                        size={18}
                      />
                    }
                  >
                    Message
                  </Button>

                </Link>

              )}

              {/* ✅ EDIT PROFILE */}
              {isCurrentUser && (

                <Button
                  variant="outline"
                  leftIcon={
                    <UserCircle
                      size={18}
                    />
                  }
                  onClick={() =>
                    navigate(
                      '/settings'
                    )
                  }
                >
                  Edit Profile
                </Button>

              )}

            </div>

          </CardBody>

        </Card>

        {/* ABOUT */}
        <Card>

          <CardHeader>

            <h2 className="text-lg font-medium text-gray-900">
              About
            </h2>

          </CardHeader>

          <CardBody>

            <p className="text-gray-700">
              {investor.bio ||
                'No bio added yet.'}
            </p>

          </CardBody>

        </Card>

        {/* INTERESTS */}
        <Card>

          <CardHeader>

            <h2 className="text-lg font-medium text-gray-900">
              Investment Interests
            </h2>

          </CardHeader>

          <CardBody>

            {investor.investmentInterests
              ?.length ? (

              <div className="flex flex-wrap gap-2">

                {investor.investmentInterests.map(
                  (
                    interest,
                    index
                  ) => (

                    <Badge
                      key={index}
                      variant="primary"
                    >
                      {interest}
                    </Badge>
                  )
                )}

              </div>

            ) : (

              <p className="text-gray-500">
                No investment interests added yet.
              </p>

            )}

          </CardBody>

        </Card>

        {/* PORTFOLIO */}
        <Card>

          <CardHeader>

            <h2 className="text-lg font-medium text-gray-900">
              Portfolio Companies
            </h2>

          </CardHeader>

          <CardBody>

            {investor.portfolioCompanies
              ?.length ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {investor.portfolioCompanies.map(
                  (
                    company,
                    index
                  ) => (

                    <div
                      key={index}
                      className="flex items-center p-3 border rounded-md"
                    >

                      <Briefcase
                        size={18}
                        className="mr-3"
                      />

                      <span>
                        {company}
                      </span>

                    </div>
                  )
                )}

              </div>

            ) : (

              <p className="text-gray-500">
                No portfolio companies available.
              </p>

            )}

          </CardBody>

        </Card>

      </div>
    );
  };