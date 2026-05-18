import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink, DollarSign, MapPin } from 'lucide-react';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface EntrepreneurCardProps {
  entrepreneur: any;
  showActions?: boolean;
}

export const EntrepreneurCard: React.FC<EntrepreneurCardProps> = ({
  entrepreneur,
  showActions = true
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/profile/entrepreneur/${entrepreneur._id}`);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/${entrepreneur._id}`);
  };

  return (
    <Card
      hoverable
      className="transition-all duration-300 h-full"
      onClick={handleViewProfile}
    >
      <CardBody className="flex flex-col">
        <div className="flex items-start">
          <Avatar
            src={entrepreneur.avatarUrl || entrepreneur.profilePic || ''}
            alt={entrepreneur.name || 'Entrepreneur'}
            size="lg"
            status={entrepreneur.isOnline || entrepreneur.isActive ? 'online' : 'offline'}
            className="mr-4"
          />

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {entrepreneur.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              {entrepreneur.startupName || 'Startup'}
            </p>

            <div className="flex flex-wrap gap-2 mb-2">
              {entrepreneur.industry && (
                <Badge variant="primary" size="sm">
                  {entrepreneur.industry}
                </Badge>
              )}
              {entrepreneur.startupStage && (
                <Badge variant="secondary" size="sm">
                  {entrepreneur.startupStage}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {entrepreneur.pitchSummary || entrepreneur.bio || 'No description available'}
          </p>
        </div>

        {/* Details */}
        <div className="mt-3 flex flex-wrap gap-4">
          {entrepreneur.fundingNeeded && (
            <div className="flex items-center text-sm text-gray-500">
              <DollarSign size={14} className="mr-1" />
              <span>
                {typeof entrepreneur.fundingNeeded === 'number'
                  ? `$${(entrepreneur.fundingNeeded / 1000000).toFixed(1)}M`
                  : entrepreneur.fundingNeeded}
              </span>
            </div>
          )}

          {entrepreneur.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={14} className="mr-1" />
              <span>{entrepreneur.location}</span>
            </div>
          )}
        </div>
      </CardBody>

      {showActions && (
        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageCircle size={16} />}
            onClick={handleMessage}
          >
            Message
          </Button>

          <Button
            variant="primary"
            size="sm"
            rightIcon={<ExternalLink size={16} />}
            onClick={handleViewProfile}
          >
            View Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};