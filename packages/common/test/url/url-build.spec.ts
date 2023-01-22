import { OpraURL } from '../../src/index.js';

describe('URL build', () => {

  it('Should set hostname', () => {
    const u = new OpraURL()
        .setHostname('www.anyuri.com');
    expect(u.href).toStrictEqual('http://www.anyuri.com');
    u.hostname = 'www.anyurl.org';
    expect(u.hostname).toStrictEqual('www.anyurl.org');
  })

  it('Should validate hostname', () => {
    const u = new OpraURL();
    expect(() => u.hostname = 'anyurl/').toThrow('Invalid');
  })

  it('Should set protocol', () => {
    const u = new OpraURL();
    u.protocol = 'http';
    expect(u.protocol).toStrictEqual('http:');
    u.protocol = 'git-ssh';
    expect(u.protocol).toStrictEqual('git-ssh:');
    u.protocol = 'https:';
    expect(u.protocol).toStrictEqual('https:');
    u.setProtocol('https')
        .setHostname('www.anyuri.com');
    expect(u.href).toStrictEqual('https://www.anyuri.com');
  })

  it('Should validate protocol', () => {
    const u = new OpraURL();
    expect(() => u.protocol = 'https:/').toThrow('Invalid');
  })

  it('Should set port', () => {
    const u = new OpraURL()
        .setHostname('www.anyuri.com')
        .setPort(81);
    expect(u.href).toStrictEqual('http://www.anyuri.com:81');
    u.setPort(1234);
    expect(u.port).toStrictEqual('1234');
    u.setPort(null);
    expect(u.port).toStrictEqual('');
  })

  it('Should validate port', () => {
    const u = new OpraURL();
    expect(() => u.setPort(-1)).toThrow('Invalid');
    expect(() => u.setPort(35536)).toThrow('Invalid');
  })

  it('Should set host', () => {
    const u = new OpraURL()
        .setHost('www.anyuri.com:81');
    expect(u.href).toStrictEqual('http://www.anyuri.com:81');
    u.host = 'www.anyurl.org:82';
    expect(u.hostname).toStrictEqual('www.anyurl.org');
    expect(u.port).toStrictEqual('82');
    u.host = 'www.otherurl.org';
    expect(u.hostname).toStrictEqual('www.otherurl.org');
    expect(u.port).toStrictEqual('');
  })

  it('Should validate host', () => {
    const u = new OpraURL();
    expect(() => u.setHost('htp:invalidUrl')).toThrow('Invalid host');
  })

  it('Should set prefix', () => {
    const u = new OpraURL();
    u.setPrefix('/api/v1');
    expect(u.href).toStrictEqual('/api/v1');
    u.prefix = 'api/v2/';
    expect(u.prefix).toStrictEqual('/api/v2');
    u.prefix = '';
    expect(u.prefix).toStrictEqual('');
  })

  it('Should normalize pathPrefix', () => {
    const u = new OpraURL();
    u.prefix = 'api/v1/?a=1';
    expect(u.prefix).toStrictEqual('/api/v1');
    u.prefix = 'api/v1#hash';
    expect(u.prefix).toStrictEqual('/api/v1');
  })

  it('Should set pathname', () => {
    const u = new OpraURL()
        .setPrefix('api/v1')
        .setPathname('Person');
    expect(u.href).toStrictEqual('/api/v1/Person');
    u.pathname = 'a b%20';
    expect(u.pathname).toStrictEqual('/a%20b%20');
  })

  it('Should add resource to path', () => {
    const u = new OpraURL()
        .join('Person')
        .join('address');
    expect(u.pathname).toStrictEqual('/Person/address');
  })

  it('Should add resource and key', () => {
    const u = new OpraURL()
        .join({resource: 'Person', key: '1234'});
    expect(u.path.get(0)).toEqual({resource: 'Person', key: '1234'});
    expect(u.path.toString()).toEqual('Person@1234');
    expect(u.pathname).toStrictEqual('/Person@1234')
  })

  it('Should set query', () => {
    const u = new OpraURL()
        .setSearch('prm1=&prm2=2');
    expect(u.search).toStrictEqual('?prm1&prm2=2');
  })

  it('Should add search param', () => {
    const u = new OpraURL()
        .addParam('prm1')
        .addParam('prm2', 2);
    expect(u.searchParams.get('prm1')).toStrictEqual(null);
    expect(u.searchParams.get('prm2')).toStrictEqual(2);
    expect(u.search).toStrictEqual('?prm1&prm2=2');
  })

  it('Should set search param', () => {
    const u = new OpraURL()
        .addParam('prm1')
        .setParam('prm1', 2);
    expect(u.searchParams.get('prm1')).toStrictEqual(2);
    expect(u.search).toStrictEqual('?prm1=2');
  })

  it('Should set hash', () => {
    const u = new OpraURL()
        .setHash('hash')
        .setHostname('www.anyuri.com');
    expect(u.href).toStrictEqual('http://www.anyuri.com#hash');
  })

})

