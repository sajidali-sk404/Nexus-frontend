import React, { useState } from 'react';
import { X, DollarSign, Calendar, User, Building2, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../../lib/api';

interface DealDetailModalProps {
    deal: any;
    onClose: () => void;
    onStatusUpdate: (dealId: string, status: string) => void;
}

const formatCurrency = (amount: number): string => {
    if (!amount) return '$0';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
};

const formatTime = (dateValue: string | Date | undefined | null): string => {
    if (!dateValue) return 'N/A';
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return 'N/A';
        return formatDistanceToNow(date, { addSuffix: true });
    } catch {
        return 'N/A';
    }
};

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
    deal,
    onClose,
    onStatusUpdate,
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState(deal.notes || []);
    const [addingNote, setAddingNote] = useState(false);

    const investor = typeof deal.investorId === 'object' ? deal.investorId : null;
    const entrepreneur = typeof deal.entrepreneurId === 'object' ? deal.entrepreneurId : null;

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            draft: 'gray', proposed: 'warning', negotiating: 'primary',
            accepted: 'success', rejected: 'error', completed: 'success', cancelled: 'gray',
        };
        return <Badge variant={variants[status] || 'gray'} className="capitalize">{status}</Badge>;
    };

    const handleAddNote = async () => {
        if (!note.trim()) return;

        try {
            setAddingNote(true);
            const response = await api.post(`/deals/${deal._id}/notes`, { content: note });
            setNotes(response.data.deal?.notes || []);
            setNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        } finally {
            setAddingNote(false);
        }
    };

    const handleMessage = (userId: string) => {
        onClose();
        navigate(`/chat/${userId}`);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{deal.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(deal.status)}
                                <span className="text-sm text-gray-500 capitalize">{deal.dealType}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Amount */}
                        <div className="bg-primary-50 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-primary-600">Deal Amount</p>
                                <p className="text-3xl font-bold text-primary-900">
                                    {formatCurrency(deal.amount)}
                                </p>
                            </div>
                            {deal.equity > 0 && (
                                <div className="text-right">
                                    <p className="text-sm text-primary-600">Equity</p>
                                    <p className="text-2xl font-bold text-primary-900">{deal.equity}%</p>
                                </div>
                            )}
                        </div>

                        {/* Parties */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Investor */}
                            <div className="border rounded-lg p-4">
                                <p className="text-xs text-gray-500 mb-2">Investor</p>
                                {investor ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Avatar
                                                src={investor.avatarUrl || investor.profilePic || ''}
                                                alt={investor.name}
                                                size="sm"
                                                className="mr-2"
                                            />
                                            <p className="text-sm font-medium">{investor.name}</p>
                                        </div>
                                        {investor._id !== user?._id && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMessage(investor._id)}
                                            >
                                                <MessageCircle size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">Not assigned</p>
                                )}
                            </div>

                            {/* Entrepreneur */}
                            <div className="border rounded-lg p-4">
                                <p className="text-xs text-gray-500 mb-2">Entrepreneur</p>
                                {entrepreneur ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Avatar
                                                src={entrepreneur.avatarUrl || entrepreneur.profilePic || ''}
                                                alt={entrepreneur.name}
                                                size="sm"
                                                className="mr-2"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">{entrepreneur.name}</p>
                                                <p className="text-xs text-gray-500">{entrepreneur.startupName}</p>
                                            </div>
                                        </div>
                                        {entrepreneur._id !== user?._id && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMessage(entrepreneur._id)}
                                            >
                                                <MessageCircle size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">Not assigned</p>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {deal.stage && (
                                <div>
                                    <p className="text-xs text-gray-500">Stage</p>
                                    <p className="text-sm font-medium capitalize">{deal.stage}</p>
                                </div>
                            )}
                            {deal.valuation > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500">Valuation</p>
                                    <p className="text-sm font-medium">{formatCurrency(deal.valuation)}</p>
                                </div>
                            )}
                            {deal.closingDate && (
                                <div>
                                    <p className="text-xs text-gray-500">Closing Date</p>
                                    <p className="text-sm font-medium">
                                        {new Date(deal.closingDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500">Created</p>
                                <p className="text-sm font-medium">{formatTime(deal.createdAt)}</p>
                            </div>
                        </div>

                        {/* Description */}
                        {deal.description && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-1">Description</h3>
                                <p className="text-sm text-gray-600">{deal.description}</p>
                            </div>
                        )}

                        {/* Terms */}
                        {deal.terms && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-1">Terms</h3>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{deal.terms}</p>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Notes</h3>

                            <div className="space-y-3 mb-4">
                                {notes.length > 0 ? (
                                    notes.map((n: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-gray-700">
                                                    {n.userId?.name || 'You'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatTime(n.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{n.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400">No notes yet</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Add a note..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                />
                                <Button
                                    size="sm"
                                    onClick={handleAddNote}
                                    disabled={!note.trim() || addingNote}
                                >
                                    {addingNote ? '...' : 'Add'}
                                </Button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">

                            {/* ── PROPOSED status ── */}
                            {deal.status === 'proposed' && user?.role === 'entrepreneur' && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() => { onStatusUpdate(deal._id, 'rejected'); onClose(); }}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => { onStatusUpdate(deal._id, 'negotiating'); onClose(); }}
                                    >
                                        Negotiate
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => { onStatusUpdate(deal._id, 'accepted'); onClose(); }}
                                    >
                                        Accept Deal
                                    </Button>
                                </>
                            )}

                            {deal.status === 'proposed' && user?.role === 'investor' && (
                                <Button
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() => { onStatusUpdate(deal._id, 'cancelled'); onClose(); }}
                                >
                                    Cancel Deal
                                </Button>
                            )}

                            {/* ── NEGOTIATING status ── */}
                            {deal.status === 'negotiating' && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() => { onStatusUpdate(deal._id, 'rejected'); onClose(); }}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => { onStatusUpdate(deal._id, 'cancelled'); onClose(); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => { onStatusUpdate(deal._id, 'accepted'); onClose(); }}
                                    >
                                        Accept Deal
                                    </Button>
                                </>
                            )}

                            {/* ── ACCEPTED status ── */}
                            {deal.status === 'accepted' && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() => { onStatusUpdate(deal._id, 'cancelled'); onClose(); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => { onStatusUpdate(deal._id, 'completed'); onClose(); }}
                                    >
                                        Mark Completed
                                    </Button>
                                </>
                            )}

                            {/* ── REJECTED / CANCELLED - allow re-propose (investor only) ── */}
                            {['rejected', 'cancelled'].includes(deal.status) && user?.role === 'investor' && (
                                <Button
                                    variant="outline"
                                    onClick={() => { onStatusUpdate(deal._id, 'proposed'); onClose(); }}
                                >
                                    Re-propose Deal
                                </Button>
                            )}

                            {/* ── Close button always visible ── */}
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};