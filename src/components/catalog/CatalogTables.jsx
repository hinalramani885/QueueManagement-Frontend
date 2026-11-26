import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Spinner, Table } from 'react-bootstrap';
import { fetchMyPlaces } from '../../redux/placeSlice';
import { fetchAdminServices } from '../../redux/serviceSlice';
import { apiErrorMessage, creatorRole, editPlacePath, filterByCreator, servicesPath } from '../../utils/catalog';
import CreatorBadge from './CreatorBadge';
import CreatorFilter from './CreatorFilter';
import './CatalogTables.css';

const countByCreator = (items) => ({
  ALL: items.length,
  ADMIN: items.filter((i) => creatorRole(i) === 'ADMIN').length,
  PROVIDER: items.filter((i) => creatorRole(i) === 'PROVIDER').length,
});

/**
 * Admin dashboard "Places & Services" tab: every place and service in the admin's scope,
 * including the ones created by their providers, with a "Created by" column and an All/Admin/Provider filter.
 */
const CatalogTables = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: places, loading: placesLoading, error: placesError } = useSelector((state) => state.places);
  const { items: services, loading: servicesLoading, error: servicesError } = useSelector((state) => state.services.adminServices);
  const [filter, setFilter] = useState('ALL');

  const refresh = () => {
    dispatch(fetchMyPlaces());
    dispatch(fetchAdminServices());
  };

  useEffect(() => {
    dispatch(fetchMyPlaces());
    dispatch(fetchAdminServices());
  }, [dispatch]);

  const visiblePlaces = useMemo(() => filterByCreator(places, filter), [places, filter]);
  const visibleServices = useMemo(() => filterByCreator(services, filter), [services, filter]);
  const counts = useMemo(() => countByCreator([...places, ...services]), [places, services]);

  return (
    <div className="qf-catalog">
      <div className="qf-catalog-toolbar">
        <div>
          <h4 className="mb-1">Places &amp; Services</h4>
          <p className="text-muted small mb-0">Everything in your scope, including items created by your providers.</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <CreatorFilter value={filter} onChange={setFilter} counts={counts} />
          <Button variant="outline-primary" size="sm" onClick={refresh} aria-label="Refresh places and services">
            <i className="bi bi-arrow-clockwise" />
          </Button>
        </div>
      </div>

      {/* ---------------- Places ---------------- */}
      <Card className="qf-catalog-card">
        <Card.Header className="qf-catalog-card-header">
          <span><i className="bi bi-buildings me-2" />Places</span>
          <Badge bg="primary" pill>{visiblePlaces.length}</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {placesLoading ? (
            <div className="qf-catalog-state"><Spinner animation="border" size="sm" className="me-2" />Loading places…</div>
          ) : placesError ? (
            <Alert variant="danger" className="m-3">{apiErrorMessage(placesError, 'Could not load places')}</Alert>
          ) : visiblePlaces.length === 0 ? (
            <div className="qf-catalog-state text-muted">No places for this filter.</div>
          ) : (
            <Table hover className="qf-catalog-table mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Created by</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visiblePlaces.map((place) => (
                  <tr key={place.id}>
                    <td data-label="Name" className="fw-semibold">{place.name}</td>
                    <td data-label="Type">{place.type}</td>
                    <td data-label="Address" className="qf-catalog-address">{place.address}</td>
                    <td data-label="Status">
                      <Badge bg={place.isActive ? 'success' : 'secondary'}>{place.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td data-label="Created by"><CreatorBadge item={place} /></td>
                    <td data-label="Actions" className="text-end text-nowrap">
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={() => navigate(servicesPath('ADMIN', place.id))}>
                        Services
                      </Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => navigate(editPlacePath('ADMIN', place.id))} aria-label={`Edit ${place.name}`}>
                        <i className="bi bi-pencil" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* ---------------- Services ---------------- */}
      <Card className="qf-catalog-card">
        <Card.Header className="qf-catalog-card-header">
          <span><i className="bi bi-list-check me-2" />Services</span>
          <Badge bg="primary" pill>{visibleServices.length}</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {servicesLoading ? (
            <div className="qf-catalog-state"><Spinner animation="border" size="sm" className="me-2" />Loading services…</div>
          ) : servicesError ? (
            <Alert variant="danger" className="m-3">{apiErrorMessage(servicesError, 'Could not load services')}</Alert>
          ) : visibleServices.length === 0 ? (
            <div className="qf-catalog-state text-muted">No services for this filter.</div>
          ) : (
            <Table hover className="qf-catalog-table mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Place</th>
                  <th>Avg. time</th>
                  <th>Status</th>
                  <th>Created by</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleServices.map((service) => (
                  <tr key={service.id}>
                    <td data-label="Name" className="fw-semibold">{service.name}</td>
                    <td data-label="Place">{service.placeName || '—'}</td>
                    <td data-label="Avg. time">{service.averageServiceTime} min</td>
                    <td data-label="Status">
                      <Badge bg={service.isActive ? 'success' : 'secondary'}>{service.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td data-label="Created by"><CreatorBadge item={service} /></td>
                    <td data-label="Actions" className="text-end">
                      <Button size="sm" variant="outline-primary" onClick={() => navigate(servicesPath('ADMIN', service.placeId))}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CatalogTables;
